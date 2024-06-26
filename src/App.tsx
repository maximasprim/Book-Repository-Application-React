import  {
  useReducer,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { bookReducer } from "./components/bookReducer";
import "./App.css";

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
}

function App() {
  const [storedBooks, setStoredBooks] = useLocalStorage<Book[]>("books", []);
  const [books, dispatch] = useReducer(bookReducer, storedBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const titleRef = useRef<HTMLInputElement>(null); //this is a reference to the input element
  const authorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const booksPerPage = 5;

  useEffect(() => {
    if (storedBooks.length) {
      dispatch({ type: "LOAD_BOOKS", books: storedBooks });
    }
  }, []);

  useEffect(() => {
    setStoredBooks(books);
  }, [books]);

  const handleAddBook = () => {
    if (titleRef.current && authorRef.current && yearRef.current) {
      const title = titleRef.current.value;
      const author = authorRef.current.value;
      const year = parseInt(yearRef.current.value, 10);
      dispatch({ type: "ADD_BOOK", book: {
        title, author, year,
        id: 0
      } });
      titleRef.current.value = "";
      authorRef.current.value = "";
      yearRef.current.value = "";
    }
  };

  const handleUpdateBook = (id: number) => {
    if (titleRef.current && authorRef.current && yearRef.current) {
      const title = titleRef.current.value || "";
      const author = authorRef.current.value || "";
      const year = parseInt(yearRef.current.value || '0', 10);
      dispatch({ type: "UPDATE_BOOK", book: { id, title, author, year } });
    }
  };

  const handleDeleteBook = (id: number) => {
    dispatch({ type: "DELETE_BOOK", id });
  };

  // const handleClearCompleted = () => {
  //   dispatch({ type: 'CLEAR_COMPLETED' });
  // };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handleNextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [totalPages]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, []);

  return (
    <div className="container">
      <h1>Book Repository Application</h1>

      <div className="form">
        <input
          className="title"
          ref={titleRef}
          type="text"
          placeholder="Title"
        />
        <input
          className="author"
          ref={authorRef}
          type="text"
          placeholder="Author"
        />
        <input
          className="year"
          ref={yearRef}
          type="number"
          placeholder="Year"
        />
        <button onClick={handleAddBook}>Add Book</button>
      </div>

      <input
        className="search-bar"
        type="text"
        placeholder="Search by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>
                  <div className="actions">
                    <div className="edit">
                    <button onClick={() => handleUpdateBook(book.id)}>
                      Edit
                    </button>
                    </div>
                    <div className="delete">
                    <button onClick={() => handleDeleteBook(book.id)}>
                      Delete
                    </button>
                    </div>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
