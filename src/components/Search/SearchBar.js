import React, { useState } from "react";
import { Button, Form, InputGroup, } from "react-bootstrap";
import { MdSearch } from "react-icons/md";
import { FaBackspace } from "react-icons/fa"
import { max } from "moment";


const SearchBar = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearInput = () => {
    setQuery('')
  }

  return (
    <>
      <Form.Group onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }} className="search">
        <InputGroup>
          <InputGroup.Text className="search-input"><MdSearch size={30} /> </InputGroup.Text>
          <Form.Control
            className="search-form"
            type="text"
            value={query}
            placeholder={placeholder || "Search..."}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="backspace">
          <FaBackspace size={40} onClick={clearInput} className="cursor-pointer" />
          </div>
        </InputGroup>
      </Form.Group>
    </>
  );
};

export default SearchBar;
