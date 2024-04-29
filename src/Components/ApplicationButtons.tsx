import '../Styles/CloseApp.css'
import '../Styles/MaximiseApp.css'
import '../Styles/MinimiseApp.css'

const { ipcRenderer } = window as any;
// import { ipcRenderer } from 'electron'; // -- Only for Unit Testing --

// Handles the maximise, minimise and closing of the application with custom buttons
function ApplicationButtons() {
    return (
        <div>
            <button className='CloseButton' onClick={() => {
                ipcRenderer.send('closeApp')
            }}>
                X
            </button>
            <button className='Maximise' onClick={() => {
                ipcRenderer.send('maximiseApp')
            }}
            >
                {String.fromCharCode(128470)}
            </button>
            <button className='Minimise' onClick={() => {
                ipcRenderer.send('minimiseApp')
            }}>
                {String.fromCharCode(8210)}
            </button>
        </div>
    )
}

export default ApplicationButtons;