import { FC, useState, ChangeEvent, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { auth, db, storage } from '../config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { ref, getDownloadURL, uploadBytes  } from 'firebase/storage'
import { Button, TextField, MenuItem, Avatar } from '@material-ui/core'
import '../style/setup.scss'

const ProfileSetup:FC<ILecturerBasic> = props => {

    const history = useHistory()
    const currentUser = auth.currentUser

    // useEffect(() => {
    //     if(currentUser && currentUser.photoURL){
    //         setPhotoURL(currentUser.photoURL)
    //     }
    // }, [currentUser])

    const titles = [
        {
            value: "Mrs.",
            label: "Mrs."
        },{
            value: "Mr.",
            label: "Mr."
        },{
            value: "Dr.",
            label: "Dr."
        },{
            value: "Prof.",
            label: "Prof."
        },{
            value: "Engr.",
            label: "Engr."
        }
    ]

    const departments = [
        {
            value: "Information and Communication Technology",
            label: "ICT"
        },
        {
            value: "Electrical and Electronics Engineering",
            label: "EEE"
        }
    ]

    const [name, setName] = useState<string>("")
    const [title, setTitle] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [department, setDepartment] = useState<string>("")
    const [location, setLocation] = useState<string>("")
    const [office, setOffice] = useState<string>("")
    const [photo, setPhoto] = useState<any>(null)
    const [photoURL, setPhotoURL] = useState<any>("https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png")
    const [uploading, setUploading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [setup, setSetup] = useState<boolean>(false)

    const uploadPicture = async (photo: any, id: any, setUploading: any) => {
        const photoRef = ref(storage, "/lecturer" + id.uid + ".png")
      
        setUploading(true)
      
        await uploadBytes(photoRef, photo)
        .then(() => {
            getDownloadURL(photoRef).then(() => {
                if(currentUser){
                    setPhotoURL(currentUser.photoURL)
                }
            }).catch((error:any) => {
                console.log(error.message, "error getting photourl")
            })
        }).catch((error:any) => {
            console.log(error.message, "error uploading")
        })

        updateProfile(id, {photoURL})
        setUploading(false)
        alert("Uploaded file!")
    }

    const submitUpload = () => {
        uploadPicture(photoURL,currentUser,setUploading)
    }
    const handlePhoto = (e:any) => {
        if(e.target.files[0])
            setPhotoURL(window.URL.createObjectURL(e.target.files[0]))
            setPhoto(e.target.files[0])
    }

    const handleTitle = (e:ChangeEvent<HTMLInputElement>) =>{
        setTitle(e.target.value)
    }

    const handleDepartment = (e:ChangeEvent<HTMLInputElement>) => {
        setDepartment(e.target.value)
    }

    const handleSetup = async () => {
        const user = auth.currentUser
        if(user !== null){
            const uid = user.uid
            const docRef = doc(db, "lecturers", uid)
            const payload = {
                name,
                title,
                phone,
                department,
                location,
                office
            }
            const setDocRef = await setDoc(docRef, payload, {merge:true})
        }
        history.replace('/dashboard')
    }

    return(
        <div className='setup-wrap'>
            <div className='setup-contain'>
                <h1>Profile Setup</h1>
                <p>Dedicated to helping you navigate your relation with lecturers</p>
                <div className='img-upload'>
                    <img src={photoURL} alt='User-Image' />
                    <input type='file' onChange={handlePhoto}/>
                    <Button variant="outlined" onClick={submitUpload} disabled={uploading || !photo} >Setup Picture</Button>
                </div>
                <div className='setup-form'>
                    <TextField
                    id="outlined-basic"
                    label="Full Name"
                    placeholder=""
                    value={name}
                    onChange={(e) =>setName(e.target.value)}
                    />
                    <TextField
                    id="outlined-basic"
                    select
                    label="Title"
                    placeholder=""
                    value={title}
                    onChange={handleTitle}
                    >
                        {titles.map((opt: any) => {
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        })}
                    </TextField>
                    <TextField
                    id="outlined-basic"
                    
                    label="Phone Number"
                    placeholder=""
                    value={phone}
                    onChange={(e) =>setPhone(e.target.value)}
                    />
                    <TextField
                    id="outlined-select-currency"
                    select
                    label="Department"
                    placeholder=""
                    value={department}
                    onChange={handleDepartment}
                    >
                        {departments.map((option: any) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                    id="outlined-basic"
                    label="Location"
                    placeholder="SEET Building"
                    value={location}
                    onChange={(e) =>setLocation(e.target.value)}
                    />
                    <TextField
                    id="outlined-basic"
                    label="Office"
                    placeholder="38, 1st Floor"
                    value={office}
                    onChange={(e) =>setOffice(e.target.value)}
                    />
                    <div className="status-btns">
                        <Button variant="outlined" className='active'>Active</Button>
                        <Button variant="outlined" className='busy'>Busy</Button>
                        <Button variant="outlined" className='absent'>Absent</Button>
                    </div>
                    <Button variant="contained" onClick={handleSetup}>DONE</Button>
                </div>
            </div>
        </div>
    )
}

export default ProfileSetup