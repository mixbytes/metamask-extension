const path = require('path')
const assert = require('assert')
const webdriver = require('selenium-webdriver')
const By = webdriver.By
const { delay, buildWebDriver } = require('./func')

describe('Metamask popup page', function () {
  let driver
  this.seedPhase
  this.accountAddress
  this.timeout(0)

  before(async function () {
    const extPath = path.resolve('dist/chrome')
    driver = buildWebDriver(extPath)
    await driver.get('chrome://extensions-frame')
    const elems = await driver.findElements(By.className('extension-list-item-wrapper'))
    const extensionId = await elems[1].getAttribute('id')
    await driver.get(`chrome-extension://${extensionId}/popup.html`)
    await delay(500)
  })

  after(async function () {
    await driver.quit()
  })

  describe('#onboarding', () => {
    it('should open Metamask.io', async function () {
      const tabs = await driver.getAllWindowHandles()
      await driver.switchTo().window(tabs[0])
      await delay(300)
    })

    it('should match title', async () => {
      const title = await driver.getTitle()
      assert.equal(title, 'MetaMask Plugin', 'title matches MetaMask Plugin')
    })

    it('should show privacy notice', async () => {
      const privacy = await driver.findElement(By.className(
        'terms-header'
      )).getText()
      assert.equal(privacy, 'PRIVACY NOTICE', 'shows privacy notice')
      driver.findElement(By.css(
        'button'
      )).click()
    })

    it('should show terms of use', async () => {
      await delay(300)
      const terms = await driver.findElement(By.className(
        'terms-header'
      )).getText()
      assert.equal(terms, 'TERMS OF USE', 'shows terms of use')
    })

    it('should be unable to continue without scolling throught the terms of use', async () => {
      const button = await driver.findElement(By.css(
        'button'
      )).isEnabled()
      assert.equal(button, false, 'disabled continue button')
      const element = driver.findElement(By.linkText(
        'Attributions'
      ))
      await driver.executeScript('arguments[0].scrollIntoView(true)', element)
    })

    it('should be able to continue when scrolled to the bottom of terms of use', async () => {
      const button = await driver.findElement(By.css('button'))
      const buttonEnabled = await button.isEnabled()
      await delay(500)
      assert.equal(buttonEnabled, true, 'enabled continue button')
      await button.click()
    })

    it('should accept password with length of eight', async () => {
      await delay(300)
      const passwordBox = await driver.findElement(By.id('password-box'))
      const passwordBoxConfirm = await driver.findElement(By.id('password-box-confirm'))
      const button = driver.findElement(By.css('button'))

      passwordBox.sendKeys('123456789')
      passwordBoxConfirm.sendKeys('123456789')
      await delay(500)
      await button.click()
    })

    it('should show value was created and seed phrase', async () => {
      await delay(700)
      this.seedPhase = await driver.findElement(By.className('twelve-word-phrase')).getText()
      const continueAfterSeedPhrase = await driver.findElement(By.css('button'))
      await continueAfterSeedPhrase.click()
    })

    it('should show lock account', async () => {
      await delay(300)
      await driver.findElement(By.className('sandwich-expando')).click()
      await delay(500)
      await driver.findElement(By.xpath('//*[@id="app-content"]/div/div[3]/span/div/li[2]')).click()
    })

    it('should accept account password after lock', async () => {
      await delay(500)
      await driver.findElement(By.id('password-box')).sendKeys('123456789')
      await driver.findElement(By.css('button')).click()
      await delay(500)
    })

    it('should show QR code', async () => {
      await delay(300)
      await driver.findElement(By.className('fa-ellipsis-h')).click()
      await driver.findElement(By.xpath('//*[@id="app-content"]/div/div[4]/div/div/div[1]/flex-column/div[1]/div/span/i/div/div/li[2]')).click()
      await delay(300)
    })

    it('should show the account address', async () => {
      this.accountAddress = await driver.findElement(By.className('ellip-address')).getText()
      await driver.findElement(By.className('fa-arrow-left')).click()
      await delay(500)
    })
  })
})
