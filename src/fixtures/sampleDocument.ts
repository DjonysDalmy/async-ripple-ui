export const sampleDocument = `asyncapi: '3.1.0'
info:
  title: Async Ripple UI Realtime API
  version: '1.0.0'
  description: Event stream documentation for user, billing, and presence workflows.
defaultContentType: application/json
servers:
  production:
    host: ws.async-ripple-ui.test
    pathname: /app/{appKey}
    protocol: wss
    description: Primary WebSocket gateway
    variables:
      appKey:
        default: local
channels:
  userSignedUp:
    address: private.users.{userId}.signed-up
    description: User lifecycle notifications scoped by account.
    parameters:
      userId:
        description: Account identifier used by private channels.
    messages:
      userSignedUp:
        $ref: '#/components/messages/UserSignedUp'
  invoicePaid:
    address: billing.invoices.paid
    description: Billing domain event emitted after payment confirmation.
    messages:
      invoicePaid:
        $ref: '#/components/messages/InvoicePaid'
  presenceUpdated:
    address: presence.team.{teamId}
    description: Presence updates for collaborative screens.
    parameters:
      teamId:
        description: Team identifier.
    messages:
      presenceUpdated:
        $ref: '#/components/messages/PresenceUpdated'
operations:
  receiveUserSignedUp:
    action: receive
    channel:
      $ref: '#/channels/userSignedUp'
    summary: Listen for newly registered users.
    messages:
      - $ref: '#/channels/userSignedUp/messages/userSignedUp'
  receiveInvoicePaid:
    action: receive
    channel:
      $ref: '#/channels/invoicePaid'
    summary: Listen for paid invoices.
    messages:
      - $ref: '#/channels/invoicePaid/messages/invoicePaid'
  receivePresenceUpdated:
    action: receive
    channel:
      $ref: '#/channels/presenceUpdated'
    summary: Listen for presence changes.
    messages:
      - $ref: '#/channels/presenceUpdated/messages/presenceUpdated'
components:
  messages:
    UserSignedUp:
      name: UserSignedUp
      title: User signed up
      summary: A user completed registration.
      payload:
        $ref: '#/components/schemas/User'
      examples:
        - payload:
            id: usr_01
            name: Ada Lovelace
            email: ada@example.com
    InvoicePaid:
      name: InvoicePaid
      title: Invoice paid
      summary: Payment was accepted by the provider.
      payload:
        $ref: '#/components/schemas/Invoice'
    PresenceUpdated:
      name: PresenceUpdated
      title: Presence updated
      summary: A member joined or left a presence channel.
      payload:
        $ref: '#/components/schemas/Presence'
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: string
          example: usr_01
        name:
          type: string
        email:
          type: string
          format: email
    Invoice:
      type: object
      required: [id, total, currency]
      properties:
        id:
          type: string
        total:
          type: number
          format: float
        currency:
          type: string
          example: BRL
    Presence:
      type: object
      properties:
        teamId:
          type: string
        userId:
          type: string
        status:
          type: string
          enum: [online, away, offline]
`
