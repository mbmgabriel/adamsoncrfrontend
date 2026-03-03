import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { MdSearch } from "react-icons/md";
import { FaBackspace } from "react-icons/fa";

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
    <Form.Group style={{ display: "flex", gap: "8px" }} className="search">
      <InputGroup>
        <InputGroup.Text className="search-input">
          <MdSearch size={30} />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={query}
          placeholder={placeholder || "Search..."}
          onChange={handleChange}
        />
        <div className="backspace">
          <FaBackspace size={40} onClick={clearInput} className="cursor-pointer" />
        </div>
      </InputGroup>
    </Form.Group>
  );
};

export default SearchBar;