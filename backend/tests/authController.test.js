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

describe(`POST ${api}/auth/login`, () => {

  beforeEach(() => {
    pool.query.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает jwt токен при удачной аутентификации', async () => {
    pool.query
    .mockResolvedValueOnce({ rows: [{ user_auth_request: 'e3a0704b-6905-413d-adf8-7a13baa37d0f' }] })
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [{ role: 0 }] });

    const res = await request(server)
      .post(`${api}/auth/login`)
      .send({ username: 'username', password: 'password' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('возвращает 400 при неправильном вводе логина или пароля', async () => {
    pool.query
    .mockResolvedValueOnce({ rows: [{ user_auth_request: 'Error: Invalid login or password' }] })
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ rows: [{ role: 0 }] });

    const res = await request(server)
      .post(`${api}/auth/login`)
      .send({ username: 'username', password: 'wrong_password' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ detail: "Invalid login or password" });
  });
});

describe(`POST ${api}/auth/refresh`, () => {

  let tokens

  beforeAll(() => {
    const user = { id: 'e3a0704b-6905-413d-adf8-7a13baa37d0f', role: '0' };
    tokens = generateTokens(user);
  });
    
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает access и refresh токены при действующем refresh токене', async () => {
    const res = await request(server)
      .post(`${api}/auth/refresh`)
      .send({ refreshToken: tokens.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('возвращает 400 при неправильном refresh токене', async () => {
    const res = await request(server)
      .post(`${api}/auth/refresh`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ detail: "Invalid refresh token" });
  });

  it('возвращает 400 при не действительном refresh токене', async () => {
    const res = await request(server)
      .post(`${api}/auth/refresh`)
      .send({ refreshToken: 'wrong_token' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ detail: "Invalid refresh token" });
  });
});

describe(`GET ${api}/auth/role`, () => {

  let token

  beforeAll(() => {
    const user = { id: 'e3a0704b-6905-413d-adf8-7a13baa37d0f', role: '0' };
    const tokens = generateTokens(user);
    token = tokens.accessToken;
  });
    
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает роль аутентифицированного пользователя', async () => {
    const res = await request(server)
      .get(`${api}/auth/role`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ role: '0' });
  });
});