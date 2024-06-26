interface Book {
    id: number;
    title: string;
    author: string;
    year: number;
  }
  
  type ActionType =
    | { type: 'ADD_BOOK'; book: Book }
    // | {type: TOGGLE_BOOK; id: number }
    | { type: 'UPDATE_BOOK'; book: Book }
    | { type: 'DELETE_BOOK'; id: number }
    | { type: 'LOAD_BOOKS'; books: Book[] };
  
  const initialBooks: Book[] = [
    { id: 1, title: '1984', author: 'George Orwell', year: 1949 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
    { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
    { id: 4, title: 'Moby Dick', author: 'Herman Melville', year: 1851 },
    { id: 5, title: 'War and Peace', author: 'Leo Tolstoy', year: 1869 },
  ];
  
  export function bookReducer(state: Book[] = initialBooks, action: ActionType): Book[] {
    switch (action.type) {
      case 'ADD_BOOK':
        return [...state, { ...action.book, id: state.length ? state[state.length - 1].id + 1 : 1 }];
      case 'UPDATE_BOOK':
        return state.map(book => (book.id === action.book.id ? action.book : book));
      case 'DELETE_BOOK':
        return state.filter(book => book.id !== action.id);
      case 'LOAD_BOOKS':
        return action.books;
      default:
        return state;
    }
  }
  