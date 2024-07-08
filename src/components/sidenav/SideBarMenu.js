import React from 'react'
import 'bootstrap/js/dist/collapse'
import '../sidenav/StyleSheet.css'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGrip, faChartLine, faCaretDown, faSackDollar, faChalkboard, faFileInvoiceDollar, faChartSimple, faMoneyCheckDollar, faBriefcase, faPeopleGroup,faCircleUser,faNoteSticky, faFilePen, faIdCardClip, faEnvelopeOpen, faFolderTree,faGear, faFlag } from '@fortawesome/free-solid-svg-icons'


function SideBarMenu({activeHeader}) {

  return (
        <div>
          <ul class="nav nav-pills flex-column" id='parentM'>
            <li class="nav-item my-1 mt-4">
              {/* <a href="/dashboard" class="nav-link dash-list " aria-current="page">
              <FontAwesomeIcon icon={faGrip} />
                <span className='ms-2 d-none d-sm-inline' >Dashboard
                </span>
              </a> */}
              <Link className={activeHeader === "dashboard" ? 'nav-link dash-list active' : 'nav-link dash-list'} to="/dashboard">
                <FontAwesomeIcon icon={faGrip} />
                <span className='ms-2 d-none d-sm-inline' >Dashboard</span>
              </Link> 
            </li>

            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#submenu"  class="nav-link dash-list" data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faChartLine} />
                <span className='ms-2 d-none d-sm-inline'> Work Flow
                <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
                </span>
              </a>
              <ul className='collapse list' id='submenu' data-bs-parent='#perentM'>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Document Type </a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Request</a>
                  </li>
              </ul>
            </li> */}

            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#financials"  class="nav-link dash-list" data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faSackDollar} />
                <span className='ms-2 d-none d-sm-inline'> Financials
                <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
                </span>
              </a>
              <ul class="collapse list" id='financials' data-bs-parent='#perentM' >
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#"> Assessment</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Budget</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Assessment Posting</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Item</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Item/Price</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Account</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Cost Center</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Document Group</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Statement of Account</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Scholarship/ Discount</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Study Load Approval</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Cashiering Item</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Accounting Reports</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Fiscal Year</a>
                  </li>
              </ul>
            </li> */}

            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#gl"  class="nav-link dash-list" data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faMoneyCheckDollar} />
                <span className='ms-2 d-none d-sm-inline'> General Ledger
                <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
                </span>
              </a>
              <ul class="collapse list" id='gl' data-bs-parent='#perentM' >
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#"> Subsidiary Ledger</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Journal Entry</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">General Journal</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">GL Balance</a>
                  </li>
              </ul>
            </li> */}

            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#expenses" class="nav-link dash-list" data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
              <span className='ms-2 d-none d-sm-inline' >Expenses
              <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
              </span>
              </a>
              <ul class="collapse list" id='expenses' data-bs-parent='#perentM' >
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Bank Information</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Cash Advance</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Accounts Payable</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Purchase Order</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Vendor</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Disbursement</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Expenses Reports</a>
                  </li>
              </ul>
            </li>

            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#assets" class="nav-link dash-list" data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faChalkboard} />
              <span className='ms-2 d-none d-sm-inline' >Assets
              <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
              </span>
              </a>
              <ul className='collapse list' id='assets' data-bs-parent='#perentM'>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Building </a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link text-black" href="#">Room</a>
                  </li>
              </ul>
            </li>


            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faChartSimple} />
              <span className='ms-2 d-none d-sm-inline' >Revenue Processing</span>
              </a>
            </li>
            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faCircleUser} />
              <span className='ms-2 d-none d-sm-inline' >Registrar</span>
              </a>
            </li>
            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faNoteSticky} />
              <span className='ms-2 d-none d-sm-inline' >Grade</span>
              </a>
            </li>
            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faFilePen} />
              <span className='ms-2 d-none d-sm-inline' >Assessment</span>
              </a>
            </li> */}

            <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#AcademicAffairs" class="nav-link dash-list"  data-bs-toggle='collapse' aria-current="page">
              <FontAwesomeIcon icon={faPeopleGroup} />
              <span className='ms-2 d-none d-sm-inline' >Academic Affairs
              <FontAwesomeIcon icon={faCaretDown} className='side-dropdown'/>
              </span>
              </a>
              <ul className='collapse list' id='AcademicAffairs' data-bs-parent='#perentM'>
                  <li class="nav-item">
                      <Link  className={activeHeader === "institution" ? 'nav-link text-black active' : 'nav-link text-black'} to="/institution">Institution</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "branch" ? 'nav-link text-black active' : 'nav-link text-black'} to="/branch">Branch</Link>
                  </li>
                  {/* <li class="nav-item">
                    <Link  className={activeHeader === "educationallevel" ? 'nav-link text-black active' : 'nav-link text-black'} to="/educationallevel">Educational Level</Link>
                  </li> */}
                  <li class="nav-item">
                    <Link  className={activeHeader === "College" ? 'nav-link text-black active' : 'nav-link text-black'} to="/collegedepartment">College</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "Department" ? 'nav-link text-black active' : 'nav-link text-black'} to="#">Department</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "program" ? 'nav-link text-black active' : 'nav-link text-black'} to="/program">Program</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "subject" ? 'nav-link text-black active' : 'nav-link text-black'} to="/subject">Subject</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "subjecttype" ? 'nav-link text-black active' : 'nav-link text-black'} to="/subjecttype">Subject Type</Link>
                  </li>
                  {/* <li class="nav-item">
                    <Link  className={activeHeader === "subjectcomponent" ? 'nav-link text-black active' : 'nav-link text-black'} to="/subjectcomponent">Subject Component</Link>
                  </li> */}
                  <li class="nav-item">
                    <Link  className={activeHeader === "curriculum" ? 'nav-link text-black active' : 'nav-link text-black'} to="/curriculum">Curriculum</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "class" ? 'nav-link text-black active' : 'nav-link text-black'} to="/class">Class</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "section" ? 'nav-link text-black active' : 'nav-link text-black'} to="/section">Section</Link>
                  </li>
                  <li class="nav-item">
                    <Link  className={activeHeader === "schoolperiod" ? 'nav-link text-black active' : 'nav-link text-black'} to="/schoolperiod">School Period</Link>
                  </li>
              </ul>
            </li>

            <li class="nav-item my-1">
              <Link className={activeHeader === "employee" ? 'nav-link dash-list active' : 'nav-link dash-list'} to="/employee">
                <FontAwesomeIcon icon={faBriefcase} />
                <span className='ms-2 d-none d-sm-inline' >Employee</span>
              </Link> 
            </li>
            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faIdCardClip} />
              <span className='ms-2 d-none d-sm-inline' >Student</span>
              </a>
            </li> */}
            <li class="nav-item my-1">
              <Link className={activeHeader === "admissions" ? 'nav-link dash-list active' : 'nav-link dash-list'} to="/admissions">
                <FontAwesomeIcon icon={faFolderTree} />
                <span className='ms-2 d-none d-sm-inline' >Admissions</span>
              </Link>         
            </li>
            <li class="nav-item my-1">
              <Link className={activeHeader === "enrollment" ? 'nav-link dash-list active' : 'nav-link dash-list'} to="/enrollment">
                <FontAwesomeIcon icon={faEnvelopeOpen} />
                <span className='ms-2 d-none d-sm-inline' >Enrollment</span>
              </Link>
            </li>
            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faGear} />
              <span className='ms-2 d-none d-sm-inline' >System</span>
              </a>
            </li> */}
            {/* <li class="nav-item my-1">
              <i className='bi bi-speedometer2' ></i>
              <a href="#" class="nav-link dash-list" aria-current="page">
              <FontAwesomeIcon icon={faFlag} />
              <span className='ms-2 d-none d-sm-inline' >Branch Report</span>
              </a>
            </li> */}
          </ul>
        </div>

      
  )
}

export default SideBarMenu