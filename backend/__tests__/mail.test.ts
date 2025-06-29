import { jest } from '@jest/globals'

// Mock nodemailer createTransport and createTestAccount
jest.unstable_mockModule('nodemailer', () => ({
  createTestAccount: jest.fn().mockResolvedValue({ user: 'testuser', pass: 'testpass' } as unknown as never),
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-id' } as unknown as never),
  })),
}))

describe('mail module', () => {
  beforeEach(() => {
    jest.resetModules() // clear module cache
    jest.clearAllMocks()
  })

  it('creates Ethereal test account transporter when CI=true', async () => {
    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      CI: true,
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
    }))

    // Now import nodemailer and mailHelper after mocks are set
    const nodemailer = await import('nodemailer')
    const { sendMail } = await import('../src/common/mailHelper.js')

    const testAccount = { user: 'testuser', pass: 'testpass' }
    const createTestAccountMock = nodemailer.createTestAccount as jest.Mock
    createTestAccountMock.mockResolvedValue(testAccount as unknown as never)

    const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' } as unknown as never)
    const createTransportMock = nodemailer.createTransport as jest.Mock
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })

    const info = await sendMail({
      from: 'from@example.com',
      to: 'to@example.com',
      subject: 'test',
      text: 'hello',
    })

    expect(nodemailer.createTestAccount).toHaveBeenCalled()

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@example.com',
      to: 'to@example.com',
      subject: 'test',
      text: 'hello',
    }))

    expect(info).toEqual({ messageId: '123' })
  })

  it('creates real SMTP transporter when CI=false', async () => {
    jest.unstable_mockModule('../src/config/env.config.js', () => ({
      CI: false,
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
    }))

    // Now import nodemailer and mailHelper after mocks are set
    const nodemailer = await import('nodemailer')
    const { sendMail } = await import('../src/common/mailHelper.js')

    const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'abc' } as unknown as never)
    const createTransportMock = nodemailer.createTransport as jest.Mock
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })

    const info = await sendMail({
      from: 'from@example.com',
      to: 'to@example.com',
      subject: 'test2',
      text: 'hello2',
    })

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    })

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@example.com',
      to: 'to@example.com',
      subject: 'test2',
      text: 'hello2',
    }))

    expect(info).toEqual({ messageId: 'abc' })
  })
})
