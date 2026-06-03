jest.mock("../../models/User");
jest.mock("express-validator", () => ({ validationResult: jest.fn() }));

const User = require("../../models/User");
const { validationResult } = require("express-validator");
const { signup, login } = require("../../controllers/authController");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth controller unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new user and returns a token", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });

    const mockedUser = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      toObject: () => ({ _id: "user123", name: "Test User", email: "test@example.com", role: "user" }),
      generateToken: () => "fake-jwt-token",
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockedUser);

    const req = { body: { name: "Test User", email: "test@example.com", password: "Password1!Secure" } };
    const res = createMockRes();
    const next = jest.fn();

    await signup(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(User.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      password: "Password1!Secure",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalledWith("token", "fake-jwt-token", expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "fake-jwt-token" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects login with invalid credentials", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const req = { body: { email: "missing@example.com", password: "Password1!Secure" } };
    const res = createMockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Invalid email or password" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("logs in an existing user and returns a token", async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });

    const mockedUser = {
      _id: "user123",
      email: "test@example.com",
      role: "user",
      password: "hashed-password",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "user123", email: "test@example.com", role: "user" }),
      generateToken: () => "login-token",
    };

    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockedUser) });

    const req = { body: { email: "test@example.com", password: "Password1!Secure" } };
    const res = createMockRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(mockedUser.comparePassword).toHaveBeenCalledWith("Password1!Secure");
    expect(mockedUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith("token", "login-token", expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "login-token" })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
