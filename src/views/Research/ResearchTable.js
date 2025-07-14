import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import Auth from '../../api/Auth'
import ResearchApplicationAPI from '../../api/ResearchApplicationAPI'
import ResearchModal from './modal/ResearchModal'

function ResearchTable() {
  const [researches, setResearches] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedResearch, setSelectedResearch] = useState()

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
      <Table striped bordered hover variant="light" responsive>
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Title</th>
            <th style={{ width: '20%' }}>Research Duration</th>
            <th style={{ width: '20%' }}>Submitted</th>
            <th style={{ width: '15%' }}>Submitted Date</th>
            <th style={{ width: '5%' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {researches.map((item) => {
            return (
              <tr>
                <td>{item.title}</td>
                <td>{item.research_duration}</td>
                <td>{item.submitted_by}</td>
                <td>{new Date(item.submitted_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</td>
                <td><Button onClick={() => handleViewResearch(item.id)}>View</Button><Button onClick={() => destroyResearch(item.id)} variant='danger'>Delete</Button></td>
              </tr>
            )
          })}
        </tbody>
      </Table>


      <ResearchModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        research={selectedResearch} />
    </div>
  )
}

export default ResearchTable