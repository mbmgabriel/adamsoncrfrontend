import React, {Component} from 'react';
import Auth from '../api/Auth';


export const UserContext = React.createContext();
export class UserContextProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      loading: true,
    };
    this.connection = React.createRef();
  }

  refreshUser = async () => {
    await this.setState({loading: true})
    let response = await new Auth().profile()
    if(response.ok) {
      console.log('res:', response?.data)
      let user = response?.data

      user.role = user?.roleName || user?.roleCode
      switch (user.role) {
        case "ADMINACC":
          user.userId = user.userId
          user.name =  user?.fullname
          user.isSchoolAdmin = true
          user.schoolId = user.schoolId
          user.schoolCode = user.code
          break;
        case "Teacher":
          user.name = `${user.teacher?.fname} ${user.teacher?.lname}`
          user.isTeacher = true;
          user.subsType = window.localStorage.getItem('subsType');
          user.athenaSub = window.localStorage.getItem('athenaSub');
          
          break;
          case "School Admin":
            user.name = `School Admin`
            user.isSchoolAdmin = true;
            user.subsType = window.localStorage.getItem('subsType');
            user.athenaSub = window.localStorage.getItem('athenaSub');
            break;
          case "Parent":
            user.name = `Parent`
            user.isParent = true;
            user.subsType = window.localStorage.getItem('subsType');
            user.athenaSub = window.localStorage.getItem('athenaSub');
            break;
          case "ADMINISTRATOR":
            user.userId = user.userId
            user.name =  user?.fullname
            user.isSystemAdmin = true
            user.schoolId = user.schoolId
            user.schoolCode = user.code
            break;
        default:
          user.name = 'No name'
          break;
      }

      await this.setState({loading: false, user})
    } else  {
      await this.setState({ loading: false, user: null})
    // Admin
      // const id = localStorage.getItem("id")
      // let response = await new Auth().profileAdmin(id)

      // if (response.ok) {
      //   let user = response?.data

      //   user.name = `${user.first_name} ${user.middle_name}`
      //   user.isAssessment_status = window.localStorage.getItem('assessment_status');
      //   user.isAdmin = true
      //   await this.setState({loading: false, user})
      // }else{
      //   await this.setState({loading: false, user: null})
      // }
    }
  };

  // setLoading = (loading) => {
  //   this.setState({loading});
  // };

  render() {
    const {children} = this.props;
    const {
      user,
      loading
    } = this.state;
    return (
      <UserContext.Provider
        value={{
          data: {
            user,
            loading,
            refreshUser: this.refreshUser
          },
        }}>
        {children}
      </UserContext.Provider>
    );
  }
}

export default UserContextProvider;
