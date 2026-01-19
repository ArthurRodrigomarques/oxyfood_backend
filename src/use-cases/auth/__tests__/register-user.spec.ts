import { expect, describe, it, beforeEach, vi } from "vitest";
import { RegisterUserUseCase } from "../register-user.use-case.js";
import { prisma } from "@/lib/prisma.js";
import { hash } from "bcrypt";

// 1. Mock do Prisma
vi.mock("@/lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// 2. Mock do Bcrypt
vi.mock("bcrypt", () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe("Register User Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be able to register a new user", async () => {
    // ARRANGE
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-123",
      name: "Arthur Teste",
      email: "arthur@teste.com",
      password_hash: "hashed-password",
      role: "OWNER",
      createdAt: new Date(),
      updatedAt: new Date(),
      asaasCustomerId: null,
      cpf: null,
    } as any);

    vi.mocked(hash as any).mockResolvedValue("hashed-password");

    const sut = new RegisterUserUseCase();

    // ACT
    const { user } = await sut.execute({
      name: "Arthur Teste",
      email: "arthur@teste.com",
      password: "password123",
      role: "OWNER",
    });

    // ASSERT
    expect(user.id).toEqual("user-123");
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(hash).toHaveBeenCalledWith("password123", 6);
  });

  it("should not be able to register with same email", async () => {
    // ARRANGE
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-existing-id",
      name: "Seu Nome",
      email: "teste@email.com",
      password_hash: "hash-antigo",
      role: "OWNER",
      createdAt: new Date(),
      updatedAt: new Date(),
      asaasCustomerId: null,
      cpf: null,
    } as any);

    const sut = new RegisterUserUseCase();

    // ACT & ASSERT
    await expect(() =>
      sut.execute({
        name: "Outro Nome",
        email: "teste@email.com",
        password: "senha123",
        role: "OWNER",
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
