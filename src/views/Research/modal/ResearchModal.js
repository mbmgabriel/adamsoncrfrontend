import React from 'react';
import { Modal, Button, Tab, Tabs, Table, Badge } from 'react-bootstrap';

const ResearchModal = ({ showModal, handleClose, research }) => {
  if (!research) return null;

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{research.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="general" className="mb-3" fill>
          <Tab eventKey="general" title="General Info">
            <p><strong>Submitted By:</strong> {research.submitted_by}</p>
            <p><strong>Submitted Date:</strong> {new Date(research.submitted_date).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> {research.research_duration}</p>
            <p><strong>Purpose ID:</strong> {research.purpose_id === 1 ? 'Initial' : 'Resubmission' }</p>  
            <p><strong>Ethical Considerations:</strong> {research.ethical_considerations ? 'With Human Participants' : 'Without Human Participants'}</p>
          </Tab>

          <Tab eventKey="categories" title="Categories">
            <ul>
              {research.category.map(cat => (
                <li key={cat.id}>{cat.research_name}</li>
              ))}
            </ul>
          </Tab>

          <Tab eventKey="endorsements" title="Endorsements">
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Representative</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {research.endorsements.map((endorse, index) => (
                  <tr key={index}>
                    <td>{endorse.rep_name}</td>
                    <td>
                      <Badge bg={endorse.status === 'Endorsed' ? 'success' : 'secondary'}>
                        {endorse.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="investigators" title="Investigators">
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Department</th>
                  <th>College</th>
                </tr>
              </thead>
              <tbody>
                {research.research_investigators.map((inv, index) => (
                  <tr key={index}>
                    <td>{inv.id_number}</td>
                    <td>{inv.name}</td>
                    <td>{inv.email}</td>
                    <td>{inv.mobile_number}</td>
                    <td>{inv.dept}</td>
                    <td>{inv.college}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="documents" title="Documents">
            <ul>
              {research.research_documents.map((doc, index) => (
                <li key={index}>
                  <strong>{doc.document_name}</strong> -{' '}
                  <a href={doc.document_filepath} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </li>
              ))}
            </ul>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResearchModal;