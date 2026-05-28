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

describe(`GET ${api}/doctor/patients`, () => {
    let token
  
    beforeAll(() => {
      pool.query.mockReset();
  
      const user = { id: 'e7bf5e23-3fc1-4a2d-924e-4ec3c0eeee25', role: '1' };
      const tokens = generateTokens(user);
      token = tokens.accessToken;
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('возвращает 401 когда пользователь не авторизирован', async () => {
      pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });
  
      const res = await request(server)
        .get(`${api}/doctor/patients`);
  
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({detail: "Authorization required"});
    });

    it('возвращает 403 когда у пользователя недостаточно прав', async () => {
      pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });
  
      const res = await request(server)
        .get(`${api}/doctor/patients`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({detail: "Invalid role"});
    });
});