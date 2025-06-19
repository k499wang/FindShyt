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
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })

  const result = await page.evaluate(() => {
    // helper to read a single computed style property
    const getProp = (el: Element | null, prop: string) =>
      el ? window.getComputedStyle(el).getPropertyValue(prop) : ''

    // extract text-color from headers and paragraphs
    const headerTags = ['h1', 'h2', 'p']
    const textColors: Record<string, string> = {}
    headerTags.forEach(tag => {
      const el = document.querySelector(tag)
      textColors[tag] = getProp(el, 'color')
    })

    // extract button styles
    const btn = document.querySelector('button')
    const buttonStyles = {
      backgroundColor: getProp(btn, 'background-color'),
      color:           getProp(btn, 'color'),
      borderRadius:    getProp(btn, 'border-radius'),
      padding:         getProp(btn, 'padding'),
      fontWeight:      getProp(btn, 'font-weight'),
    }

    // extract form border for border in color schema
    const form = document.querySelector('form')
    const formBorder = getProp(form, 'border')

    // determine layout (very basic)
    const layout = form
      ? window.getComputedStyle(form!).getPropertyValue('margin').includes('auto')
        ? 'centered'
        : 'left-aligned-card'
      : 'centered'

    return {
      url: window.location.href,
      title: document.title || window.location.hostname,
      colors: {
        primary:   buttonStyles.backgroundColor,
        secondary: buttonStyles.color,
        background: getProp(document.querySelector('body'), 'background-color'),
        text:      textColors.p,
        border:    formBorder || buttonStyles.borderRadius || 'none'
      },
      fonts: {
        primary:   getProp(document.querySelector('body'), 'font-family'),
        secondary: getProp(btn, 'font-family')
      },
      layout,
      textColors,     // { h1: "...", h2: "...", p: "..." }
      buttonStyles,   // { backgroundColor, color, borderRadius, padding, fontWeight }
      formStyles: {
        border:      formBorder,
        borderRadius: getProp(form, 'border-radius'),
        padding:      getProp(form, 'padding')
      },
      scrapedAt: new Date().toISOString()
    }
  })

  await browser.close()
  return result
}
