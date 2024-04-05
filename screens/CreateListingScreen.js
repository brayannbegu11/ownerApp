import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import * as Location from 'expo-location';

function CreateListingScreen({ navigation }) {
    const [vehicles, setVehicles] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredVehicles, setFilteredVehicles] = useState([]);

    const [vehicleName, setVehicleName] = useState('');
    const [vehiclePhoto, setVehiclePhoto] = useState('');
    const [seatingCapacity, setSeatingCapacity] = useState('');
    const [electricRange, setElectricRange] = useState('');
    const [totalRange, setTotalRange] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [rentalPrice, setRentalPrice] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 })


    useEffect(() => {
        fetchVehicles();
    }, []);
    useEffect(() => {
        const filtered = vehicles.filter(vehicle =>
            vehicle.make.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredVehicles(filtered);
    }, [searchText, vehicles]);


    const resetFields = () => {
        setElectricRange('')
        setVehicleName('')
        setVehiclePhoto('')
        setSeatingCapacity('')
        setTotalRange('')
        setLicensePlate('')
        setPickupLocation('')
        setRentalPrice('')
        setCoordinates('')
    }

    const fetchVehicles = async () => {
        try {
            const response = await fetch('https://brayannbegu11.github.io/vehicles/vehicles.json');
            const data = await response.json();
            setVehicles(data);
        } catch (error) {
            console.error(error);
        }
    };



    const handleVehicleSelect = (vehicle) => {
        setVehicleName(`${vehicle.make} ${vehicle.model} ${vehicle.trim}`);
        setVehiclePhoto(vehicle.images[0]?.url_full || '');
        setSeatingCapacity(vehicle.seats_min);
        setElectricRange(vehicle.electric_range);
        setTotalRange(vehicle.total_range);

    };
    const doForwardGeocode = async () => {
        try {
            console.log(`Attempting to geocode: ${pickupLocation}`)
            const geocodedLocation = await Location.geocodeAsync(pickupLocation)

            const result = geocodedLocation[0]
            if (result === undefined) {
                return
            }
            console.log(result)
            alert(JSON.stringify(result))

            return result

        } catch (err) {
            console.log(err)
        }
    }
    const handleSubmit = async () => {
        const result = await doForwardGeocode()

        const user = auth.currentUser

        let pfp = ''
        if (user !== null) {
            if (user.email === "owner1@gmail.com") pfp = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwMzQtZWxlbWVudC0wNi0zOTcucG5n.png'
            if (user.email === "owner2@gmail.com") pfp = 'https://www.vhv.rs/dpng/d/551-5511364_circle-profile-man-hd-png-download.png'
            try {
                const vehiclesColRef = collection(db, 'vehicles');

                const vehicleToInsert = {
                    vehicleName,
                    vehiclePhoto,
                    seatingCapacity,
                    electricRange,
                    totalRange,
                    licensePlate,
                    coordinates: {
                        lat: result.latitude,
                        lng: result.longitude
                    },
                    rentalPrice,
                    owner: user.email,
                    ownerPhoto: pfp
                };

                await addDoc(vehiclesColRef, vehicleToInsert);

                Alert.alert("Listing Created", "Your vehicle listing has been created successfully!");
                resetFields()
            } catch (error) {
                console.error("Error adding document: ", error);
                Alert.alert("Error", "There was an error creating your vehicle listing.");
            }
        } else {
            Alert.alert("Not signed in", "You must be signed in to create a listing.");
        }
    };

    const handleLogout = async () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            ),
            headerTitle: "Search",
        });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search Vehicle Make (e.g., Audi)"
                value={searchText}
                onChangeText={setSearchText}
            />
            <TextInput style={styles.input} placeholder="Vehicle Name" value={vehicleName} onChangeText={setVehicleName} />

            <TextInput style={styles.input} placeholder="Seating Capacity" value={String(seatingCapacity)} onChangeText={text => setSeatingCapacity(text)} />
            <TextInput style={styles.input} placeholder="Electric Range" value={String(electricRange)} onChangeText={text => setElectricRange(text)} />
            <TextInput style={styles.input} placeholder="Total Range" value={String(totalRange)} onChangeText={text => setTotalRange(text)} />
            <TextInput
                style={styles.input}
                placeholder="License Plate (e.g., BLHT281)"
                value={licensePlate}
                onChangeText={setLicensePlate}
            />
            <TextInput
                style={styles.input}
                placeholder="Pickup Location Address (e.g., 153 Main St, Seattle, WA, USA)"
                value={pickupLocation}
                onChangeText={setPickupLocation}
            />
            <TextInput
                style={styles.input}
                placeholder="Rental Price for a Week (e.g., $250)"
                value={rentalPrice}
                onChangeText={setRentalPrice}
            />
            {vehiclePhoto !== '' && <Image style={styles.vehicleImage} source={{ uri: vehiclePhoto }} />}
            <Button title="Create Listing" onPress={handleSubmit} />
            <FlatList
                data={filteredVehicles}
                keyExtractor={item => item.handle}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => handleVehicleSelect(item)}>
                        <Text>{`${item.make} ${item.model} ${item.trim}`}</Text>
                        {item.images && item.images.length > 0 && (
                            <Image style={styles.image} source={{ uri: item.images[0].url_thumbnail }} />
                        )}
                    </TouchableOpacity>
                )}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    },
    image: {
        width: 50,
        height: 50,
        marginLeft: 10,
        borderRadius: 25,
    },
    vehicleImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginTop: 10,
        borderRadius: 8,
    },
    logoutButton: {
        marginRight: 10,
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
    },
});

export default CreateListingScreen;
