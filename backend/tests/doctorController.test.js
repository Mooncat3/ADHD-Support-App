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

describe(`GET ${api}/doctor/get`, () => {
  let token
  let blank_token

  beforeAll(() => {
    pool.query.mockReset();

    const user = { id: 'e3a0704b-6905-413d-adf8-7a13baa37d0f', role: '0' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;

    const blank_user = { id: 'e3a0704b-6905-413d-adf8-7a13baa87d00', role: '0' };
    const blank_tokens = generateTokens(blank_user);
    blank_token = blank_tokens.accessToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает данные врача при наличии', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [{ 
      activity: null,
      email: "test@test.com",
      firstname: "test",
      id: "e3a0704b-6905-413d-adf8-7a13baa37d0f",
      lastname: "test",
      level: null,
      login: "test",
      role: 0,
      surname: "test"
    }] });

    const res = await request(server)
      .get(`${api}/doctor/get`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ 
      activity: null,
      email: "test@test.com",
      firstname: "test",
      id: "e3a0704b-6905-413d-adf8-7a13baa37d0f",
      lastname: "test",
      level: null,
      login: "test",
      role: 0,
      surname: "test",
    });
  });

  it('возвращает 404 если данных врача нет', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [] });

    const res = await request(server)
      .get(`${api}/doctor/get`)
      .set('Authorization', `Bearer ${blank_token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ detail: 'No doctor data' });
  });
});

describe(`GET ${api}/doctor/patients`, () => {
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

  it('возвращает данные о пациентах врача при наличии', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [
      {
        firstname: 'test',
        surname: 'test',
        lastname: 'test',
        login: 'test',
        email: 'test@test.com',
        patient_id: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25',
        level: 2,
        activity: { level: 2, tap_count: [6, 10], selected_time: [10, 11] }
      },
      {
        firstname: 'test',
        surname: 'test',
        lastname: 'test',
        login: 'test1',
        email: 'test@test.com',
        patient_id: '50a43349-8a9e-4a37-8137-dfb01f26ae6a',
        level: 1,
        activity: { level: 2, tap_count: 10, selected_time: [9, 11] }
      }] });

    const res = await request(server)
      .get(`${api}/doctor/patients`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{
      firstname: 'test',
      surname: 'test',
      lastname: 'test',
      login: 'test',
      email: 'test@test.com',
      patient_id: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25',
      level: 2,
      activity: { level: 2, tap_count: [6, 10], selected_time: [10, 11] }
    },
    {
      firstname: 'test',
      surname: 'test',
      lastname: 'test',
      login: 'test1',
      email: 'test@test.com',
      patient_id: '50a43349-8a9e-4a37-8137-dfb01f26ae6a',
      level: 1,
      activity: { level: 2, tap_count: 10, selected_time: [9, 11] }
    }]);
  });

  it('возвращает 404 если данных о пациентах врача нет', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [] });

    const res = await request(server)
      .get(`${api}/doctor/patients`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ detail: "No patients found for this doctor" });
  });

    it('возвращает 404 если данных о пациентах врача нет', async () => {
    pool.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [] });

    const res = await request(server)
      .get(`${api}/doctor/patients`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ detail: "No patients found for this doctor" });
  });
});

describe(`POST ${api}/doctor/register`, () => {
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

  it('регистрирует нового пациента врача', async () => {
    pool.query
      .mockResolvedValueOnce({rows: [{user_register: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25'}]})

    const res = await request(server)
      .post(`${api}/doctor/register`)
      .send({ username: 'test', password: 'password', email: 'test@test.com', firstName: 'test', secondName: 'test', patronymic: 'test' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: `Patient with ID e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25 registered`});
  });

  it('возвращает 400 если существует пользователь с таким же логином', async () => {
    pool.query
      .mockResolvedValueOnce({rows: [{user_register: 'Error: User with this login or email already exists'}]});

    const res = await request(server)
      .post(`${api}/doctor/register`)
      .send({ username: 'test', password: 'password', email: 'test@test.com', firstName: 'test', secondName: 'test', patronymic: 'test' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ detail: "User with this login or email already exists" });
  });
});

describe(`GET ${api}/doctor/activity/:patientId`, () => {
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

  it('получает данные активности пациента при наличии', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({rows: [{
        level: 1,
        tap_count: 10,
        selected_time: ["10","12","18"]
     }] });

    const res = await request(server)
      .get(`${api}/doctor/activity/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      level: 1,
      tap_count: 10,
      selected_time: ["10","12","18"]
    });
  });

  it('возвращает 404 если данных активности пациента нет', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({rows: [] });

    const res = await request(server)
      .get(`${api}/doctor/activity/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ detail: "Activity do not exist" });
  });
});

describe(`PUT ${api}/doctor/activity/:patientId`, () => {
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

  it('сохраняем данные активности пациента', async () => {
    pool.query
      .mockResolvedValueOnce({rows: [{ activityId: 'e3a0704b-6905-413d-adf8-7a13baa37d01' }]})

    const res = await request(server)
      .put(`${api}/doctor/activity/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .send({activity: {
        level: 1,
        tap_count: 10,
        selected_time: ["10", "12", "18"]
      }})
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Activity successfully changed" });
  });

  it('возвращает 400 если не удалось сохранить активность пациента', async () => {
    pool.query
      .mockResolvedValueOnce({rows: []})

    const res = await request(server)
      .put(`${api}/doctor/activity/e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25`)
      .send({activity: {
        level: 1,
        tap_count: 10,
        selected_time: ["10", "12", "18"]
      }})
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ detail: "Failed to put activity" });
  });
});