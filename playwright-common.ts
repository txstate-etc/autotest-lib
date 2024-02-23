import { test, expect, type Page, type Response, type Request } from '@playwright/test'

export function pageLoads (title: string, url: string, status: number) {
  test(`${title} - Loads`, async ({ page }) => {
    const loadResponse: Response | null = await page.goto(url)
    expect(loadResponse?.status()).toBe(status)
  })
}
export function pageDependenciesLoad (title: string, url: string, status: number) {
    test(`${title} - Loads Dependencies`, async ({ page }) => {
    // Register page event listeners...
    // Capture all the page's depencency requests.
    const requests: Request[] = []
    page.on('request', request => requests.push(request))
    // Log all client side console logs to command terminal.
    page.on('console', async (msg) => {
      const msgArgs = msg.args()
      const logValues = await Promise.all(msgArgs.map(async arg => await arg.jsonValue()))
      console.log(...logValues)
    })

    // Navigate to the page and wait for all requests to resolve.
    await page.goto(url)
    // Collect all page load sub-request responses.
    const responses = await Promise.all(requests.map(request => request.response()))
    // console.log(responses.filter(resp => resp?.status() !== 200).map(resp => ({ url: resp?.url(), status: resp?.status()})))
    expect(responses.every(response => response?.status() === status)).toBeTruthy()
  })
}

export async function pageStandardTests (title: string, url: string, status: number) {
  test.describe(`${title} - Standard Page Tests`, () => {
    pageLoads(title, url, status)
    pageDependenciesLoad(title, url, status)
    test(`${title} - Has A Title`, async ({ page }) => {
      await page.goto(url)
      await expect(page).toHaveTitle(/.*/)
    })
  })
}
