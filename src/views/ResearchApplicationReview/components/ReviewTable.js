import React, { useEffect, useState } from 'react'
import { Button, Table, Nav, Badge } from 'react-bootstrap'
import Auth from '../../../api/Auth'
import ResearchApplicationAPI from '../../../api/ResearchApplicationAPI'
import SearchBar from '../../../components/Search/SearchBar'
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import Tooltip from '../../../components/Tooltip/Tooltip'
import Pagination from '../../../components/PaginationComponent/Pagination'
import { useHistory } from 'react-router-dom'

function ReviewTable() {
  const history = useHistory()
  const [researches, setResearches] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const fetchResearches = async () => {
    const response = await new Auth().fetchResearches()
    if (response.ok) {
      setResearches(response.data)
    } else {
      console.error(response.error)
    }
  }

  useEffect(() => {
    fetchResearches()
  }, [])

  const displayedResearches = researches
    .slice((page - 1) * pageSize, page * pageSize)

  const totalItems = researches.length
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className='research-table'>
      <div className='research-container'>
        <div className='title'>New Research Application Review</div>
        <div className='search-div'>
          <SearchBar placeholder="(Type to search Research Title, Research Name)" />
          <Tooltip text="Export to PDF" position="bottom">
            <FaFilePdf size={30} className='cursor-pointer' color='white' />
          </Tooltip>
          <Tooltip text="Export to CSV" position="bottom">
            <FaFileCsv size={30} className='cursor-pointer' color='white' />
          </Tooltip>
        </div>
        <Nav
          className="mt-4 research-tabs"
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
            <Nav.Link eventKey="link-3">Endorsed</Nav.Link>
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
              {displayedResearches.map((item) => (
                <tr key={item.id} onClick={() => history.push(`/review-form/${item.id}`)}>
                  <td>{item.title}</td>
                  <td>{item.submitted_by}</td>
                  <td style={{ textAlign: 'center' }}><Badge>Completed</Badge></td>
                </tr>
              ))}
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
