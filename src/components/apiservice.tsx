import axios from 'axios';

export const fetchBooks = async () => {
    const response = await axios.get('https://book-application-api-1.onrender.com/books');
  console.log("Fetched books",response.data);
  return response.data;
};
export const updateBook = async (id: number, title: string) => {
    try {
      const response = await axios.put(`https://book-application-api-1.onrender.com/books/${id}`, { title });
      console.log("Updated book", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  };
  export const addBook = async (book: { title: string; author: string; year: number; addedDate: string; }) => {
    const response = await axios.post('https://book-application-api-1.onrender.com/books', book);
    console.log("Added book", response.data);
    return response.data;
  };