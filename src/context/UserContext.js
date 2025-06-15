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
    const id = localStorage.getItem("id")
    let response = await new Auth().profile(id)
    if(response.ok) {
      console.log('res:', response?.data)
      let user = response?.data

      user.role = user?.UserAccount?.role_name
      switch (user.role) {
        case "Administrator":
          user.userId = user?.UserAccount?.user_id
          break;
        default:
          user.name = 'No name'
          break;
      }

      await this.setState({loading: false, user})
    } else  {
      await this.setState({ loading: false, user: null})
    }
  };

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
