import type { Agency } from "@/lib/quote-types"
import type { EquipmentPrices } from "@/lib/prices-storage"
import { calculateTotalCost, calculateEquipmentSummary, getSplitterType } from "@/lib/quote-types"

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadImageAsBase64(src: string): Promise<string> {
  const response = await fetch(src)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Contexto de página para evitar pasar 10 parámetros en cada función
interface PageCtx {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any
  pageW: number
  pageH: number
  margin: number
  contentW: number
  footerH: number       // altura reservada para el footer
  nexumnetB64: string
  claroB64: string
  today: string
  pageCount: { n: number }
}

/** Agrega footer en la página actual */
function drawFooter(ctx: PageCtx) {
  const { doc, pageW, pageH, footerH } = ctx
  doc.setFillColor(241, 245, 249)
  doc.rect(0, pageH - footerH, pageW, footerH, "F")
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(
    "Este documento es una cotización referencial generada por Nexumnet.",
    pageW / 2,
    pageH - footerH + 5,
    { align: "center" }
  )
  doc.text(
    `Página ${ctx.pageCount.n}`,
    pageW / 2,
    pageH - footerH + 10,
    { align: "center" }
  )
}

/** Encabezado de continuación (páginas 2+) */
function drawContinuationHeader(ctx: PageCtx): number {
  const { doc, pageW, margin } = ctx
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 14, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("COTIZACIÓN DE EQUIPOS MULTIMEDIA", pageW / 2, 9, { align: "center" })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${ctx.today}`, margin, 9)
  return 22 // y de inicio del contenido — margen moderado bajo la franja
}

/**
 * Verifica si queda espacio suficiente. Si no, agrega página nueva
 * y devuelve el nuevo Y de inicio.
 */
function ensureSpace(ctx: PageCtx, y: number, needed: number): number {
  const { doc, pageH, footerH } = ctx
  if (y + needed > pageH - footerH - 4) {
    drawFooter(ctx)
    doc.addPage()
    ctx.pageCount.n++
    return drawContinuationHeader(ctx)
  }
  return y
}

// ── Sección: TV visuales ──────────────────────────────────────────────────────

function drawTVs(
  ctx: PageCtx,
  env: Agency["environments"][number],
  y: number
) {
  const { doc, pageW, margin } = ctx
  const tvW = 7
  const tvH = 5
  const tvGap = 2
  const groupGap = 4

  const groupColors: [number, number, number][] = [
    [37, 99, 235],
    [16, 185, 129],
    [245, 158, 11],
    [239, 68, 68],
  ]

  const totalTvWidth =
    env.contentGroups.reduce((acc, g) => acc + g.screenCount * (tvW + tvGap), 0) +
    (env.contentGroups.length - 1) * groupGap

  const tvStartX = pageW - margin - totalTvWidth - 2
  const tvTopY = y - 1
  let xCursor = tvStartX

  env.contentGroups.forEach((group, gIdx) => {
    const [r, g2, b] = groupColors[gIdx % groupColors.length]

    for (let t = 0; t < group.screenCount; t++) {
      doc.setFillColor(r, g2, b)
      doc.roundedRect(xCursor, tvTopY, tvW, tvH, 0.8, 0.8, "F")
      doc.setFillColor(255, 255, 255)
      doc.rect(xCursor + 0.8, tvTopY + 0.8, tvW - 1.6, tvH - 2, "F")
      doc.setFillColor(r, g2, b)
      doc.rect(xCursor + tvW / 2 - 0.8, tvTopY + tvH, 1.6, 1, "F")
      doc.rect(xCursor + tvW / 2 - 2, tvTopY + tvH + 1, 4, 0.6, "F")
      xCursor += tvW + tvGap
    }

    if (env.contentGroups.length > 1) {
      const groupStartX =
        tvStartX +
        env.contentGroups
          .slice(0, gIdx)
          .reduce((acc, g) => acc + g.screenCount * (tvW + tvGap) + groupGap, 0)
      doc.setFontSize(5.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(r, g2, b)
      doc.text(`C${gIdx + 1}`, groupStartX, tvTopY + tvH + 4)
    }

    xCursor += groupGap
  })
}

// ── Sección: título de bloque ─────────────────────────────────────────────────

function drawSectionTitle(ctx: PageCtx, y: number, title: string): number {
  const { doc, pageW, margin } = ctx
  y = ensureSpace(ctx, y, 14)
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(title, margin, y)
  y += 2  // línea pegada al título
  doc.setDrawColor(200, 210, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 5  // espacio bajo la línea antes del contenido
  return y
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function generateQuotePDF(
  agencies: Agency[],
  prices: EquipmentPrices,
  paymentTerms: number
): Promise<void> {
  const { default: jsPDF } = await import("jspdf")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18
  const footerH = 16

  let nexumnetB64 = ""
  let claroB64 = ""
  try {
    nexumnetB64 = await loadImageAsBase64("/logo-nexumnet.png")
    claroB64 = await loadImageAsBase64("/logo-claro.png")
  } catch { /* logos opcionales */ }

  const today = new Date().toLocaleDateString("es-MX", {
    day: "2-digit", month: "long", year: "numeric",
  })

  const ctx: PageCtx = {
    doc,
    pageW,
    pageH,
    margin,
    contentW: pageW - margin * 2,
    footerH,
    nexumnetB64,
    claroB64,
    today,
    pageCount: { n: 1 },
  }

  const { summary } = calculateTotalCost(agencies, prices)

  // Calcular por separado: equipos+licencias+banco vs. mantenimiento
  const equipmentAndCommissionTotal = agencies.reduce((total, agency) => {
    const agencySummary = calculateEquipmentSummary([agency])
    const agencyEquipmentCost =
      agencySummary.mediaPlayers * prices.MEDIA_PLAYER +
      agencySummary.splitters1x2 * prices.SPLITTER_1X2 +
      agencySummary.splitters1x4 * prices.SPLITTER_1X4 +
      agencySummary.splitters1x8 * prices.SPLITTER_1X8 +
      agencySummary.hdmiCables * prices.HDMI_CABLE +
      agencySummary.mediaPlayers * prices.MEDIA_PLAYER_LICENSE
    const agencySubtotal = agencyEquipmentCost + prices.MONTHLY_MAINTENANCE_PER_AGENCY
    const agencyBankingCommission =
      (agencySubtotal * prices.BANKING_COMMISSION_RATE * paymentTerms) / 100
    return total + agencyEquipmentCost + agencyBankingCommission
  }, 0)

  const maintenanceTotal = agencies.length * prices.MONTHLY_MAINTENANCE_PER_AGENCY
  const grandTotalMonthly = (equipmentAndCommissionTotal + maintenanceTotal) / paymentTerms
  const monthlyEquipmentAndCommission = equipmentAndCommissionTotal / paymentTerms
  const monthlyMaintenance = maintenanceTotal

  // ── HEADER PÁGINA 1 ───────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 38, "F")

  const logoH = 14
  const logoNexW = 36
  const logoClaroW = 28

  if (nexumnetB64) {
    doc.addImage(nexumnetB64, "PNG", margin, 12, logoNexW, logoH, undefined, "FAST")
  } else {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text("NEXUMNET", margin, 22)
  }

  if (claroB64) {
    doc.addImage(claroB64, "PNG", pageW - margin - logoClaroW, 12, logoClaroW, logoH, undefined, "FAST")
  } else {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text("CLARO", pageW - margin - 20, 22)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("COTIZACIÓN DE EQUIPOS MULTIMEDIA", pageW / 2, 20, { align: "center" })
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${today}`, pageW / 2, 27, { align: "center" })

  let y = 48

  // ── AGENCIAS CONFIGURADAS ─────────────────────────────────────────────────
  y = drawSectionTitle(ctx, y, "AGENCIAS CONFIGURADAS")

  agencies.forEach((agency) => {
    // Nombre de agencia — necesita al menos 16mm (nombre + 1 ambiente)
    y = ensureSpace(ctx, y, 16)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 41, 59)
    doc.text(agency.name, margin, y)
    y += 5

    agency.environments.forEach((env) => {
      // Cada fila de ambiente ocupa ~11mm
      y = ensureSpace(ctx, y, 13)

      const splitterInfo = env.contentGroups
        .map((g) => {
          const sp = getSplitterType(g.screenCount)
          return sp ? `1 Splitter ${sp.type}` : null
        })
        .filter(Boolean)

      // Nombre ambiente
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 41, 59)
      doc.text(`  • ${env.name}`, margin + 2, y)

      // Descripción
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      doc.text(
        `    ${env.screenCount} TV${env.screenCount > 1 ? "s" : ""}, ` +
          `${env.mediaPlayerCount} Media Player${env.mediaPlayerCount > 1 ? "s" : ""}` +
          (splitterInfo.length ? `, ${splitterInfo.join(", ")}` : ""),
        margin + 2,
        y + 4
      )

      // TVs visuales a la derecha
      drawTVs(ctx, env, y)

      y += 11
    })
    y += 3
  })

  y += 2

  // ── DETALLE DE EQUIPOS ────────────────────────────────────────────────────
  y = drawSectionTitle(ctx, y, "DETALLE DE EQUIPOS")

  // Encabezado tabla — solo EQUIPO y CANT.
  y = ensureSpace(ctx, y, 16)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, ctx.contentW, 7, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("EQUIPO", margin + 2, y + 5)
  doc.text("Cantidad", margin + ctx.contentW - 15, y + 5, { align: "center" })
  y += 9

  const equipRows: { label: string; qty: number }[] = []
  if (summary.mediaPlayers > 0)
    equipRows.push({ label: "Media Player", qty: summary.mediaPlayers })
  if (summary.splitters1x2 > 0)
    equipRows.push({ label: "Splitter 1×2", qty: summary.splitters1x2 })
  if (summary.splitters1x4 > 0)
    equipRows.push({ label: "Splitter 1×4", qty: summary.splitters1x4 })
  if (summary.splitters1x8 > 0)
    equipRows.push({ label: "Splitter 1×8", qty: summary.splitters1x8 })
  if (summary.hdmiCables > 0)
    equipRows.push({ label: "Cable HDMI", qty: summary.hdmiCables })

  equipRows.forEach((row, i) => {
    y = ensureSpace(ctx, y, 8)
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - 1, ctx.contentW, 7, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(row.label, margin + 2, y + 4)
    doc.text(String(row.qty), margin + ctx.contentW - 15, y + 4, { align: "center" })
    y += 7
  })

  y += 6

  // ── CUOTA MENSUAL ─────────────────────────────────────────────────────────
  y = drawSectionTitle(ctx, y, "CUOTA MENSUAL")

  y = ensureSpace(ctx, y, 8)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text(`Plazo seleccionado: ${paymentTerms} meses`, margin, y)
  y += 10

  // Fila pago equipos + comisión
  y = ensureSpace(ctx, y, 10)
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y - 2, ctx.contentW, 8, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  doc.text("Pago Mensual de Equipos", margin + 2, y + 4)
  doc.setFont("helvetica", "bold")
  doc.text(formatCurrency(monthlyEquipmentAndCommission), margin + ctx.contentW, y + 4, { align: "right" })
  y += 10

  // Fila mantenimiento
  y = ensureSpace(ctx, y, 10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(30, 41, 59)
  doc.text(
    `Pago Mensual de Mantenimiento (${agencies.length} agencia${agencies.length > 1 ? "s" : ""} × ${formatCurrency(prices.MONTHLY_MAINTENANCE_PER_AGENCY)})`,
    margin + 2,
    y + 4
  )
  doc.setFont("helvetica", "bold")
  doc.text(formatCurrency(monthlyMaintenance), margin + ctx.contentW, y + 4, { align: "right" })
  y += 12

  // Caja total mensual — necesita 26mm
  y = ensureSpace(ctx, y, 26)
  doc.setFillColor(37, 99, 235)
  doc.roundedRect(margin, y, ctx.contentW, 20, 3, 3, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("TOTAL MENSUAL A PAGAR", pageW / 2, y + 6, { align: "center" })
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(formatCurrency(grandTotalMonthly), pageW / 2, y + 14, { align: "center" })
  y += 24

  y = ensureSpace(ctx, y, 6)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`por mes durante ${paymentTerms} meses`, pageW / 2, y, { align: "center" })

  // ── FOOTER ÚLTIMA PÁGINA ──────────────────────────────────────────────────
  drawFooter(ctx)

  // ── DESCARGA ──────────────────────────────────────────────────────────────
  const fileName = `cotizacion-multimedia-${today.replace(/\s/g, "-")}.pdf`
  doc.save(fileName)
}
