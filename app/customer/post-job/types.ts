export type Category = {
  id: number;
  name: string;
};

export type JobFormData = {
  title: string;
  description: string;
  address: string;
  categoryId: number;
};
