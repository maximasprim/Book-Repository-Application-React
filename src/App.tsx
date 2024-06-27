import { useReducer, useState, useRef, useEffect, useCallback } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { bookReducer } from "./components/bookReducer";
import { fetchBooks, updateBook, addBook, deleteBook } from "./components/apiservice";
import "./App.css";

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  addedDate: string;
}

function App() {
  const [storedBooks, setStoredBooks] = useLocalStorage<Book[]>("books", []);
  const [books, dispatch] = useReducer(bookReducer, storedBooks);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("titleAsc");
  const [editMode, setEditMode] = useState(false);
  const [editBookId, setEditBookId] = useState<number | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const booksPerPage = 5;

  // Fetch books from the API when the component mounts
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await fetchBooks();
        console.log("Books data:", booksData);
        dispatch({ type: "LOAD_BOOKS", books: booksData });
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    setStoredBooks(books);
  }, [books]);

  const handleEditBook = (book: Book) => {
    setEditMode(true);
    setEditBookId(book.id);
    if (titleRef.current) titleRef.current.value = book.title;
    if (authorRef.current) authorRef.current.value = book.author;
    if (yearRef.current) yearRef.current.value = book.year.toString();
  };

  const handleSaveBook = async () => {
    if (titleRef.current && authorRef.current && yearRef.current) {
      const title = titleRef.current.value;
      const author = authorRef.current.value;
      const year = parseInt(yearRef.current.value, 10);
      const addedDate = new Date().toISOString();

      if (editMode && editBookId !== null) {
        try {
          await updateBook(editBookId, title, author, year);
          dispatch({
            type: "UPDATE_BOOK",
            book: {
              id: editBookId,
              title,
              author,
              year,
              addedDate,
            },
          });
        } catch (error) {
          console.error("Error updating book:", error);
        }
      } else {
        try {
          const newBook = await addBook({ title, author, year, addedDate });
          dispatch({
            type: "ADD_BOOK",
            book: {
              id: newBook.id,
              title,
              author,
              year,
              addedDate,
            },
          });
        } catch (error) {
          console.error("Error adding book:", error);
        }
      }


      setEditMode(false);
      setEditBookId(null);
      titleRef.current.value = "";
      authorRef.current.value = "";
      yearRef.current.value = "";
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await deleteBook(id);
      dispatch({ type: "DELETE_BOOK", id });
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const filteredBooks = books
    .filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "titleAsc") {
        return a.title.localeCompare(b.title);
      } else if (filter === "titleDesc") {
        return b.title.localeCompare(a.title);
      } else if (filter === "dateAsc") {
        return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
      } else if (filter === "dateDesc") {
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
      return 0;
    });

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
  <input className="title" ref={titleRef} type="text" placeholder="Title" />
  <input
    className="author"
    ref={authorRef}
    type="text"
    placeholder="Author"
  />
  <input className="year" ref={yearRef} type="number" placeholder="Year" />
  <button onClick={handleSaveBook}>
    {editMode ? "Save Changes" : "Add Book"}
  </button>
</div>

<input
  className="search-bar"
  type="text"
  placeholder="Search by title"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

<select
  className="filter-dropdown"
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
>
  <option value="titleAsc">Title (A-Z)</option>
  <option value="titleDesc">Title (Z-A)</option>
  <option value="dateAsc">Date Added (Oldest First)</option>
  <option value="dateDesc">Date Added (Newest First)</option>
</select>

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
                <button onClick={() => handleEditBook(book)}>Edit</button>
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