import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { MdClose, MdSearch } from "react-icons/md";

const SearchBar = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  const clearInput = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <Form.Group className="search">
      <InputGroup>
        <InputGroup.Text className="search-input">
          <MdSearch aria-hidden="true" />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={query}
          placeholder={placeholder || "Search..."}
          onChange={handleChange}
          aria-label={placeholder || "Search"}
        />
        {query && (
          <button
            type="button"
            className="backspace"
            onClick={clearInput}
            aria-label="Clear search"
          >
            <MdClose aria-hidden="true" />
          </button>
        )}
      </InputGroup>
    </Form.Group>
  );
};

export default SearchBar;
