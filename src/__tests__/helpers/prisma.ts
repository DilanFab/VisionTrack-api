export const mockTransaction = () => {
  const { mockDeep } = require("jest-mock-extended");
  return mockDeep();
};

export const resetMocks = () => {
  jest.clearAllMocks();
};
