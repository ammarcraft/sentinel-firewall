import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Custom Vite plugin to handle saving reports directly to C:\Users\ammar\OneDrive\Desktop\Firewall\Reports
function reportExporterPlugin() {
  return {
    name: 'sentinel-report-exporter',
    configureServer(server) {
      server.middlewares.use('/api/save-report', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const { filename, content, encoding } = JSON.parse(body)
              const reportsDir = path.resolve(process.cwd(), 'Reports')
              if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true })
              }
              const safeFilename = filename || `sentinel_report_${Date.now()}.csv`
              const targetPath = path.join(reportsDir, safeFilename)

              if (encoding === 'base64') {
                fs.writeFileSync(targetPath, Buffer.from(content, 'base64'))
              } else {
                fs.writeFileSync(targetPath, content, 'utf8')
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                filename: safeFilename,
                path: targetPath,
                directory: reportsDir
              }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.setHeader('Content-Type', 'text/plain')
          res.end('Method Not Allowed')
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    reportExporterPlugin(),
  ],
})

