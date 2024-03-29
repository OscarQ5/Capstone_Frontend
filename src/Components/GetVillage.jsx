import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLoginDataProvider } from "../Components/LoginProvider";
import "../Styles/GetVillage.css"

const GetVillage = () => {
    const { village_id } = useParams();
    const [village, setVillage] = useState(null);
    const { API, token, user } = useLoginDataProvider();
    const [allUsers, setAllUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [villageUsers, setVillageUsers] = useState([]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone_number: '',
    });
    console.log('Village ID:', village_id);

    // Get all users to filter number
    useEffect(() => {
        fetch(`${API}/users`, {
            headers: {
                "Authorization": token
            }
        })
            .then((res) => res.json())
            .then((res) => setAllUsers(res))
            .catch((error) => console.error("Error fetching all users:", error));
    }, [API, token]);

    // Get village detail
    useEffect(() => {
        if (!village_id) return;

        fetch(`${API}/users/villages/${village_id}`, {
            headers: {
                "Authorization": token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch village');
                }
                return res.json();
            })
            .then((data) => setVillage(data))
            .catch((error) => console.error("Error fetching village:", error));
    }, [API, token, village_id]);

    const handleSearch = (e) => {
        e.preventDefault();

        const results = allUsers.filter(user =>
            user.phone_number === formData.phone_number
        );

        setSearchResults(results);
    };

    //Adding users to a specific village
    const handleAddToVillage = async (userId) => {
        try {
            const requestBody = { user_id: userId, village_id: +village_id };

            const response = await fetch(`${API}/users/village-users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // After successful addition, fetch updated village users
                const updatedResponse = await fetch(`${API}/users/village-users/${village_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': token
                    },
                });
                const updatedData = await updatedResponse.json();
                const usersWithInfo = await Promise.all(updatedData.map(async (user) => {
                    const userInfoResponse = await fetch(`${API}/users/${user.user_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': token
                        },
                    });
                    const userInfo = await userInfoResponse.json();
                    return { ...user, userInfo };
                }))
                setVillageUsers(usersWithInfo);

                // Update the search results with the newly added user
                const updatedSearchResults = searchResults.filter(result => result.user_id !== userId);
                setSearchResults(updatedSearchResults);
            } else {
                const errorData = await response.json();
                console.error('Error Response:', errorData);
                throw new Error(errorData.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API}/users/village-users/${village_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': token
                    },
                });
                const data = await response.json()
                const usersWithInfo = await Promise.all(data.map(async (user) => {
                    const userInfoResponse = await fetch(`${API}/users/${user.user_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': token
                        },
                    });
                    const userInfo = await userInfoResponse.json();
                    return { ...user, userInfo };
                }))
                setVillageUsers(usersWithInfo)
            } catch (error) {
                console.error(error)
            }
        };

        fetchData()
    }, [village_id, API, token]);

    const handleDelete = (villageUserId) => {
        fetch(`${API}/users/village-users/${villageUserId}`, {
            method: "DELETE",
            headers: {
                "Authorization": token
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to delete");
                }
                console.log("Completed Delete");

                // Remove the deleted user from villageUsers state
                setVillageUsers(prevUsers => prevUsers.filter(user => user.user_id !== villageUserId));
            })
            .catch(err => console.error("Error deleting:", err));
    };

    const { phone_number } = formData;

    if (!village) {
        return <div>Loading...</div>;
    }

    return (
        <div className="getVillageBody">
            <h2>Village Details</h2>
            <div className="searchR">
                <h2>Find User</h2>
                <div className="phoneFilter">

                    <form onSubmit={handleSearch}>
                        <label htmlFor="phone_number">Enter Phone Number:</label>
                        <input
                            type="text"
                            id="phone_number"
                            value={phone_number}
                            placeholder="ex. 212-222-2222"
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                        <div>
                            <h2>Search Result:</h2>
                            {searchResults.map((result) => (
                                <div key={result.user_id} className="search-result">
                                    <h2>Name: {result.name}</h2> <h2> Phone Number: {result.phone_number}</h2>
                                    <button className='addButton' onClick={() => handleAddToVillage(result.user_id, village_id)}>Add</button>
                                </div>
                            ))}

                        </div>
                        <button type="submit">Search</button>
                    </form>

                </div>

            </div>
            <div className='villageDetail'>
                <h2>Village Name: {village.village_name}</h2>
                <div>

                    <div >
                        {villageUsers.map(user => (
                            <div className="villageMemberCard" key={user.user_id}>
                                <h2>
                                    Name: {user.userInfo.name} <br />
                                    Phone Number: {user.userInfo.phone_number}<br />
                                    Role: {user.is_admin ? 'Admin' : 'Member'}
                                </h2>
                                <button className="deleteButton" onClick={() => {
                                    console.log("Deleting user with ID:", user.user_id);
                                    handleDelete(user.user_id);
                                }}>❌</button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <Link to='/users/villages'><button>Back</button></Link>
        </div>
    );
};

export default GetVillage;
