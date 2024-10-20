"use strict"
import React from 'react';
import { useRepoState, useRepoDispatch } from '../src';

const RightPanel = () => {
  const [userName, setUserName] = useRepoState('user.name');
  const [email, setEmail] = useRepoState('user.contact.email');
  const [phone, setPhone] = useRepoState('user.contact.phone');
  const [books] = useRepoState('books');
  const [borrowedBooks] = useRepoState('user.borrowBooks');

  const dispatch = useRepoDispatch();

  const borrowBook = (book) => {
    dispatch('user.borrowBooks', 'add', book);
    dispatch('books', 'remove', book);
  };

  const returnBook = (book) => {
    dispatch('user.borrowBooks', 'remove', book);
    dispatch('books', 'add', book);
  };

  return (
    <div className="p-4 w-3/4">
      <h3 className="text-xl font-bold mb-4">User Info</h3>

      <div className="mb-4">
        <label className="block mb-2">Name:</label>
        <input
          className="border p-2 w-full"
          value={userName}
          onChange={(e) => setUserName(null, e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Email:</label>
        <input
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(null, e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Phone:</label>
        <input
          className="border p-2 w-full"
          value={phone}
          onChange={(e) => setPhone(null, e.target.value)}
        />
      </div>

      <div className="flex justify-between">
        <div className="w-1/2 pr-2">
          <h3 className="text-xl font-bold mb-4">Available Books</h3>
          {books.map((book, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{book}</span>
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={() => borrowBook(book)}
              >
                Borrow
              </button>
            </div>
          ))}
        </div>

        <div className="w-1/2 pl-2">
          <h3 className="text-xl font-bold mb-4">Borrowed Books</h3>
          {borrowedBooks.map((book, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{book}</span>
              <button
                className="bg-red-500 text-white p-2 rounded"
                onClick={() => returnBook(book)}
              >
                Return
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
