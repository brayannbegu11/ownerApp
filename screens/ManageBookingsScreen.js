import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ManageBookingsScreen = ({ navigation }) => {
    const [bookingsList, setBookingsList] = useState([]);

    const retrieveFromDb = () => {
        const user = auth.currentUser;

        if (user !== null) {
            const q = query(collection(db, "bookings"), where("owner", "==", user.email));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const resultsFromFirestore = [];
                querySnapshot.forEach((doc) => {
                    resultsFromFirestore.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setBookingsList(resultsFromFirestore);
            });

            return () => unsubscribe();
        }
    };

    useEffect(() => {
        retrieveFromDb();
    }, []);

    const handleApprove = async (bookingId) => {
        const confirmationCode = Math.random().toString(36).substr(2, 9);

        await updateDoc(doc(db, "bookings", bookingId), {
            bookingStatus: 'Approved',
            confirmationCode: confirmationCode
        });

        retrieveFromDb();
        Alert.alert("Booking Approved", `Confirmation code: ${confirmationCode}`);
    };

    const handleDecline = async (bookingId) => {
        await updateDoc(doc(db, "bookings", bookingId), {
            bookingStatus: 'Declined'
        });

        retrieveFromDb();
        Alert.alert("Booking Declined");
    };

    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingItem}>
            <Text style={styles.detailText}>Vehicle: {item.vehicleName}</Text>
            <Text style={styles.detailText}>License Plate: {item.licensePlate}</Text>
            <Text style={styles.detailText}>Price: ${item.rentalPrice}</Text>
            <Text style={styles.detailText}>Renter Email: {item.renter}</Text>
            <Image source={{ uri: item.renterPhoto }} style={styles.renterPhoto} />
            <Text style={styles.detailText}>Booking Date: {item.bookingDate}</Text>
            <Text style={styles.detailText}>Booking Status: {item.bookingStatus}</Text>
            {item.bookingStatus === 'Approved' && <Text style={styles.detailText}>Confirmation Code: {item.confirmationCode}</Text>}
            {item.bookingStatus === 'Pending' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonApprove} onPress={() => handleApprove(item.id)}>
                        <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonDecline} onPress={() => handleDecline(item.id)}>
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <FlatList
            data={bookingsList}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id}
        />
    );
};

const styles = StyleSheet.create({
    bookingItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    detailText: {
        fontSize: 16,
        marginVertical: 2,
    },
    renterPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    buttonApprove: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
    },
    buttonDecline: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
    },
});

export default ManageBookingsScreen;
