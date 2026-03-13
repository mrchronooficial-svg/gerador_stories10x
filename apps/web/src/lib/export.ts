// ---------------------------------------------------------------------------
// Single PNG download
// ---------------------------------------------------------------------------

/**
 * Download a single canvas as a PNG file.
 */
export async function downloadStoryAsPNG(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'))
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename.endsWith('.png') ? filename : `${filename}.png`
        document.body.appendChild(link)
        link.click()

        // Cleanup after a short delay to ensure the download starts
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          resolve()
        }, 100)
      },
      'image/png',
      1.0
    )
  })
}

// ---------------------------------------------------------------------------
// ZIP download (all slides)
// ---------------------------------------------------------------------------

/**
 * Convert a canvas to a Blob (PNG).
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'))
          return
        }
        resolve(blob)
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Sanitise a string for use as a filename/folder name.
 */
function sanitiseFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * Download all canvases as a ZIP file containing numbered PNGs.
 * Uses dynamic import for JSZip to keep it out of the main bundle.
 */
export async function downloadAllAsZIP(
  canvases: HTMLCanvasElement[],
  sequenceName: string
): Promise<void> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  const safeName = sanitiseFilename(sequenceName)

  const folder = zip.folder(safeName)
  if (!folder) {
    throw new Error('Failed to create ZIP folder')
  }

  // Convert each canvas to PNG and add to the ZIP folder
  const promises = canvases.map(async (canvas, index) => {
    const blob = await canvasToBlob(canvas)
    const arrayBuffer = await blob.arrayBuffer()
    const paddedNumber = String(index + 1).padStart(2, '0')
    folder.file(`story-${paddedNumber}.png`, arrayBuffer)
  })

  await Promise.all(promises)

  // Generate the ZIP with compression
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  // Trigger download
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName}-stories.zip`
  document.body.appendChild(link)
  link.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
