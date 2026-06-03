const request = require("supertest");
const app = require("../../server");

const agent = request.agent(app);

describe("Notes CRUD integration tests", () => {
  const signupData = {
    name: "Integration User",
    email: "integration@example.com",
    password: "Integration1!Pass",
  };

  const notePayload = {
    title: "Integration Note",
    topic: "Testing",
    difficulty: "Easy",
    tags: ["integration", "notes"],
    personalExplanation: "This is a test note.",
    codeSolution: "const example = true;",
    revisionNotes: "Review later",
    checklist: [{ text: "Write test", done: true }],
  };

  it("signs up, creates, reads, updates, and deletes a note", async () => {
    const signupResponse = await agent.post("/api/auth/signup").send(signupData);
    expect(signupResponse.status).toBe(201);
    expect(signupResponse.body.success).toBe(true);

    const createResponse = await agent.post("/api/notes").send(notePayload);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.note.title).toBe("Integration Note");

    const noteId = createResponse.body.note._id;

    const listResponse = await agent.get("/api/notes");
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body.notes)).toBe(true);
    expect(listResponse.body.notes).toHaveLength(1);

    const detailResponse = await agent.get(`/api/notes/${noteId}`);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.note._id).toBe(noteId);

    const updateResponse = await agent.put(`/api/notes/${noteId}`).send({ title: "Updated Integration Note" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.note.title).toBe("Updated Integration Note");

    const deleteResponse = await agent.delete(`/api/notes/${noteId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    const finalListResponse = await agent.get("/api/notes");
    expect(finalListResponse.status).toBe(200);
    expect(finalListResponse.body.notes).toHaveLength(0);
  });
});
