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

describe(`GET ${api}/patient/get`, () => {

  let token

  beforeEach(() => {
    pool.query.mockReset();

    const user = { id: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25', role: '1' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает данные пациента при наличии', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [{
      id: "e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25",
      activity: null,
      firstname: "test",
      lastname: "test",
      surname: "test"
    }] });

    const res = await request(server)
      .get(`${api}/patient/get`)
      .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        id: "e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25",
        activity: null,
        firstname: "test",
        lastname: "test",
        surname: "test"
      });
    });

    it('возвращает 404 если данных пациента нет', async () => {
      pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });
  
      const res = await request(server)
        .get(`${api}/patient/get`)
        .set('Authorization', `Bearer ${token}`);
  
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ detail: "No patient data" });
      });
});

describe(`POST ${api}/patient/setAllStatistic`, () => {

  let token

  beforeEach(() => {
    pool.query.mockReset();

    const user = { id: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25', role: '1' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('сохраняет данные статистики пациента', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{activity: {
        level: 1,
        tap_count: 10,
        selected_time: ["10", "12", "18"]
      }}] });

    const res = await request(server)
      .post(`${api}/patient/setAllStatistic`)
      .send({data: [{
        date: 1739307600,
        level: 1,
        time_stat:{
            10:  {
              timestamp_start: 32400,
              success: true,
              in_time: true,
              tap_count: [10]
            },
        }}]})
      .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        message: "Statistics successfully sent to db",
      });
    });
});