import request from "supertest";
import server from "../server";
import { generateTokens } from "../controllers/authController"

jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn() // мокаем query
  },
}));

import pool from "../config/db";

const api = process.env.MAIN_API_URL;

describe(`GET ${api}/statistic/get/:patientId`, () => {

  let token

  beforeAll(() => {
    pool.query.mockReset();

    const user = { id: 'e3a0704b-6905-413d-adf8-7a13baa37d0f', role: '0' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает статистику пациента за период при наличии', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [
      {
        date: new Date('2025-02-15T00:00:00.000Z'),
        data: {
          time_stat: {
            '9':  {
              timestamp_start: 32400,
              success: true,
              in_time: false,
              tap_count: [10],
              patient_timezone: 0
            }
          }
        }  
      }
    ]});

    const res = await request(server)
      .get(`${api}/statistic/get/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .query({ startDate: '2020-04-28T00:00:00.000Z', endDate: '2025-04-28T00:00:00.000Z' })
      .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{
        date: '2025-02-15T00:00:00.000Z',
        data: {
        time_stat: {
          '9':  {
            timestamp_start: 32400,
            success: true,
            in_time: false,
            tap_count: [10],
            patient_timezone: 0
          }
        }
        }}
      ]);
    });

    it('возвращает 404 если статистики пациента за период нет', async () => {
      pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [
        {
          date: new Date('2025-06-15T00:00:00.000Z'),
          data: {
            time_stat: {
              '9':  {
                timestamp_start: 32400,
                success: true,
                in_time: false,
                tap_count: [10],
                patient_timezone: 0
              }
            }
          }  
        }
      ]});
  
      const res = await request(server)
        .get(`${api}/statistic/get/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
        .query({ startDate: '2020-04-28T00:00:00.000Z', endDate: '2025-04-28T00:00:00.000Z' })
        .set('Authorization', `Bearer ${token}`);
  
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ detail: "Statistic does not exist" });
      });
});

describe(`POST ${api}/statistic/file/:patientId`, () => {

  let token

  beforeAll(() => {
    pool.query.mockReset();

    const user = { id: 'e3a0704b-6905-413d-adf8-7a13baa37d0f', role: '0' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает pdf-файл статистики пациента при наличии', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [
      {
        date: new Date('2025-02-15T00:00:00.000Z'),
        data: {
          time_stat: {
            '9':  {
              timestamp_start: 32400,
              success: true,
              in_time: false,
              tap_count: [10],
              patient_timezone: 0
            }
          }
        }  
      }
    ]})
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [{ firstname: 'test', surname: 'test', lastname: 'test' }]});

    const res = await request(server)
      .post(`${api}/statistic/file/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .send({ startDate: '2020-04-28T00:00:00.000Z', endDate: '2025-04-28T00:00:00.000Z', timezone: 0 })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/pdf')
      .expect('Content-Type', /pdf/)

      expect(res.statusCode).toBe(200);
      expect(res.body instanceof Buffer);

      const pdfSignature = '%PDF-';
      const firstBytes = res.body.toString('utf8', 0, 5);
  
      expect(firstBytes).toBe(pdfSignature);
    });

    it('возвращает 404 если статистики пациента за период нет', async () => {
      pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [
        {
          date: new Date('2025-06-15T00:00:00.000Z'),
          data: {
            time_stat: {
              '9':  {
                timestamp_start: 32400,
                success: true,
                in_time: false,
                tap_count: [10],
                patient_timezone: 0
              }
            }
          }  
        }
      ]})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ firstname: 'test', surname: 'test', lastname: 'test' }]});
  
      const res = await request(server)
        .post(`${api}/statistic/file/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
        .send({ startDate: '2020-04-28T00:00:00.000Z', endDate: '2025-04-28T00:00:00.000Z', timezone: 0 })
        .set('Authorization', `Bearer ${token}`)
  
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ detail: "Statistics do not exist" });
      });
});