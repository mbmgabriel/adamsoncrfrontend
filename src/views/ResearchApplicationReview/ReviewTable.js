import React, { useEffect, useState } from 'react'
import { Button, Table, Nav, Badge } from 'react-bootstrap'
import Auth from '../../api/Auth'
import ResearchApplicationAPI from '../../api/ResearchApplicationAPI'
import SearchBar from '../../components/Search/SearchBar'
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import Tooltip from '../../components/Tooltip/Tooltip'
import Pagination from '../../components/PaginationComponent/Pagination'


function ReviewTable() {
  const [researches, setResearches] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedResearch, setSelectedResearch] = useState()
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const totalItems = 60;
  const totalPages = Math.ceil(totalItems / pageSize);

  const fetchResearches = async () => {
    let response = await new Auth().fetchResearches()
    if (response.ok) {
      setResearches(response.data)
    } else {
      console.error(response.error)
    }
  }

  const fetchResearchById = async (id) => {
    let response = await new ResearchApplicationAPI().fetchResearchById(id)
    if (response.ok) {
      setSelectedResearch(response.data.Research)
    } else {
      console.error(response.errorMessage)
    }
  }

  useEffect(() => {
    fetchResearches()
  }, [])

  const destroyResearch = async (id) => {
    let response = await new ResearchApplicationAPI().destroyResearch(id)
    if (response.ok) {
      alert('Research Deleted')
      fetchResearches()
    } else {
      alert('Something went wrong')
    }
  }

  const handleViewResearch = (id) => {
    setShowModal(true);
    fetchResearchById(id);
  }

  return (
    <div className='research-table'>
      <div className='research-container'>
        <div className='title'>New Research Application Review</div>
        <div className='search-div'>
          <SearchBar placeholder="(Type to search Research Title, Research Name)" />
          <Tooltip text="Export to PDF" position="bottom"><FaFilePdf size={30} className='cursor-pointer' color='white' /></Tooltip>
          <Tooltip text="Export to CSV" position="bottom"><FaFileCsv size={30} className='cursor-pointer' color='white' /></Tooltip>
        </div>
        <Nav
          className="mt-4 research-tabs"
          // onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
          variant='underline'
        >
          <Nav.Item>
            <Nav.Link eventKey="link-0">All</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-1">New</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-2">Revised</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-3">
              Endorsed
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <div className='table-div'>
          <Table striped bordered hover variant="light" responsive>
            <thead>
              <tr>
                <th style={{ width: '55%', textAlign: 'center' }}>Research Title</th>
                <th style={{ width: '25%', textAlign: 'center' }}>Lead Researcher Name</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Research Status</th>
              </tr>
            </thead>
            <tbody>
              {researches.map((item) => {
                return (
                  <tr>
                    <td>{item.title}</td>
                    <td>{item.submitted_by}</td>
                    {/* <td><Button onClick={() => handleViewResearch(item.id)}>View</Button><Button onClick={() => destroyResearch(item.id)} variant='danger'>Delete</Button></td> */}
                    <td style={{ textAlign: 'center' }}><Badge>Completed</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}

export default ReviewTable