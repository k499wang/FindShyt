import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }


    const analysis = await getStyleAnalysisWithPuppeteer(url)

    console.log('Style analysis result:', analysis)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Style scraping error:', error)
    return NextResponse.json({ error: 'Failed to analyze website style' }, { status: 500 })
  }
}

async function getStyleAnalysisWithPuppeteer(pageUrl: string) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  // Set a reasonable viewport or user-agent if needed
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })

  // Evaluate computed styles in the page context
  const result = await page.evaluate(() => {
    // Helper to get computed style properties
    const getStyles = (el: Element | null, props: string[]) => {
      if (!el) return {}
      const styles = window.getComputedStyle(el)
      return props.reduce((acc, prop) => {
        acc[prop] = styles.getPropertyValue(prop)
        return acc
      }, {} as Record<string, string>)
    }

    // Extract styles from elements you care about
    const bodyStyles = getStyles(document.querySelector('body'), [
      'background-color',
      'color',
      'font-family'
    ])

    // Find first <button> or default to body
    const button = document.querySelector('button')
    const buttonStyles = getStyles(button, [
      'background-color',
      'color',
      'border-radius',
      'padding',
      'font-weight'
    ])

    // Find first <form> or fallback
    const form = document.querySelector('form')
    const formStyles = getStyles(form, [
      'border',
      'border-radius',
      'padding',
      'background-color'
    ])

    const layout = document.querySelector('form')
      ? window.getComputedStyle(form!).getPropertyValue('margin')
        .includes('auto')
        ? 'centered'
        : 'left-aligned-card'
      : 'centered'

    return {
      title: document.title || window.location.hostname,
      colors: {
        primary: buttonStyles['background-color'] || bodyStyles['background-color'],
        secondary: buttonStyles['color'] || bodyStyles['color'],
        background: bodyStyles['background-color'],
        text: bodyStyles['color'],
        border: formStyles['border'] || buttonStyles['border'] || 'none'
      },
      fonts: {
        primary: bodyStyles['font-family'],
        secondary: buttonStyles['font-family'] || bodyStyles['font-family']
      },
      layout,
      buttonStyles: {
        borderRadius: buttonStyles['border-radius'],
        padding: buttonStyles['padding'],
        fontWeight: buttonStyles['font-weight']
      },
      formStyles: {
        border: formStyles['border'],
        borderRadius: formStyles['border-radius'],
        padding: formStyles['padding']
      },
      scrapedAt: new Date().toISOString()
    }
  })

  await browser.close()
  return { url: pageUrl, ...result }
}
