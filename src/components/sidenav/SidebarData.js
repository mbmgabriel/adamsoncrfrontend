import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faArrowRight, faHouse, faChartLine, faCaretDown, faSackDollar, faChalkboard, faFileInvoiceDollar, faChartSimple, faMoneyCheckDollar, faBriefcase, faPeopleGroup, faCircleUser, faNoteSticky, faFilePen, faIdCardClip, faEnvelopeOpen, faFolderTree, faGear, faFlag, faGrip } from '@fortawesome/free-solid-svg-icons'

export const SideBarData = [
	{
		title: 'Dashboard',
		path: '/dashboard',
		icon: <FontAwesomeIcon icon={faGrip} />,
		iconClosed: <FontAwesomeIcon icon={faAngleDown} />,
		iconOpened: <FontAwesomeIcon icon={faAngleUp} />,
		// subNav: [
		// 	{
		// 		title: 'Home',
		// 		path: '/subject',
		// 		icon: <FontAwesomeIcon icon={faHouse} />,
		// 	}
		// ]
	},
	{
		title: 'Academic Affairs',
		// path: '',
		icon: <FontAwesomeIcon icon={faPeopleGroup} />,
		iconClosed: <FontAwesomeIcon icon={faAngleDown} />,
		iconOpened: <FontAwesomeIcon icon={faAngleUp} />,
		subNav: [
			{
				title: 'Institution',
				path: '/institution',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Branch',
				path: '/branch',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'School Period',
				path: '/schoolperiod',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Subject Type',
				path: '/subjecttype',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Department',
				path: '/collegedepartment',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Program',
				path: '/program',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Subject',
				path: '/subject',
				icon: <span>&#9900;</span>,
			},
			{
				title: 'Curriculum',
				path: '/curriculum',
				icon: <span>&#9900;</span>,
			},
			// {
			// 	title: 'Class',
			// 	path: '/class',
			// 	icon: <span>&#9900;</span>,
			// },
			{
				title: 'Section',
				path: '/section',
				icon: <span>&#9900;</span>,
			},
		]
	},
	{
    title: 'Employee',
    path: '/employee',
    icon: <FontAwesomeIcon icon={faBriefcase}/>,
    iconClosed: <FontAwesomeIcon icon={faAngleDown} />,
    iconOpened: <FontAwesomeIcon icon={faAngleUp} />,
  },
	{
    title: 'Admissions',
    path: '/admissions',
    icon: <FontAwesomeIcon icon={faFolderTree}/>,
    iconClosed: <FontAwesomeIcon icon={faAngleDown} />,
    iconOpened: <FontAwesomeIcon icon={faAngleUp} />,
  },
	{
    title: 'Enrollment',
    path: '/enrollment',
    icon: <FontAwesomeIcon icon={faEnvelopeOpen}/>,
    iconClosed: <FontAwesomeIcon icon={faAngleDown} />,
    iconOpened: <FontAwesomeIcon icon={faAngleUp} />,
  }
]
