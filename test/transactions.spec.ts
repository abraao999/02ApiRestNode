import {
  afterAll,
  beforeAll,
  test,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('criar uma nova transacao', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tranction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('deve ser possivel listar as transacoes', async () => {
    const createTrasactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tranction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionsResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({ title: 'new tranction', amount: 5000 }),
    ])
  })

  it('deve ser possivel listar uma trasacoes especifica', async () => {
    const createTrasactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tranction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionsResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionsId = listTransactionResponse.body.transactions[0].id

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionsId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({ title: 'new tranction', amount: 5000 }),
    )
  })

  it.only('deve ser possivel mostrar a soma das transacoes', async () => {
    const createTrasactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new tranction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTrasactionsResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'new tranction',
        amount: 2000,
        type: 'debit',
      })

    const sumaryResponse = await request(app.server)
      .get('/transactions/sumary')
      .set('Cookie', cookies)
      .expect(200)

    expect(sumaryResponse.body.sumary).toEqual({ amount: 3000 })
  })
})
