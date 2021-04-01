import crypto from 'crypto'

const signatureCheck = function verifySignature (
  secret /* Secret specified on Cyanite.ai */,
  signature /* Signature sent via the Signature header */,
  body /* raw request body */
) {
  const hmac = crypto.createHmac('sha512', secret)
  hmac.write(body)
  hmac.end()
  const compareSignature = hmac.read().toString('hex')
  if (signature !== compareSignature) {
    throw new Error('Invalid signature')
  }
}

module.exports = signatureCheck
