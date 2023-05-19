const { nanoid } = require('nanoid');
const bookself = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    reading,
    id,
    insertedAt,
    updatedAt,
  };
  
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (pageCount === undefined || readPage === undefined) {
    const response = h.response();
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  bookself.push(newBook);

  const isSuccess = bookself.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name) {
    const lowName = name.toLowerCase();

    const response = h.response({
      status: 'success',
      data: {
        books: bookself
        .filter((books) => books.name === lowName)
        .map((books) => ({
          id: books.id,
          name: books.name,
          publisher: books.publisher
        })),
      },
    });

    response.code(200);
    return response;
  }

  if (reading) {
    const response = h.response({
      status: "success",
      data: {
        books: bookself
          .filter((books) => books.reading === reading)
          .map((books) => ({
            id: books.id,
            name: books.name,
            publisher: books.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  if (finished !== undefined) {
    const response = h.response({
      status: "success",
      data: {
        books: bookself
          .filter((books) => books.finished == finished)
          .map((books) => ({
            id: books.id,
            name: books.name,
            publisher: books.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "success",
    data: {
      books: bookself.map((books) => ({
        id: books.id,
        name: books.name,
        publisher: books.publisher,
      })),
    },
  });

  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = bookself.filter(({id}) => id === bookId)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = bookself.findIndex(({id}) => id === bookId);

  if (index !== -1) {

    if (name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku'
      });
      response.code(400);
      return response;
    }

    if (pageCount < readPage) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
      });
      response.code(400);
      return response;
    }
    
    bookself[index] = {
      ...bookself[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = bookself.findIndex(({id}) => id === bookId);

  if (index !== -1) {
    bookself.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler,
};
