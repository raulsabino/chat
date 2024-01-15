import React, { useState } from 'react';
import Colorful from '@uiw/react-color-colorful';
import { hsvaToHex } from '@uiw/color-convert';

const ColorPicker = ({ isOpen }) => {
    const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState('--text'); // default selection

    const handleChange = (colorHsva) => {
        setHsva(colorHsva);
        document.documentElement.style.setProperty(selectedVariable, hsvaToHex(colorHsva));
    }

    const handleToggle = (color) => {
        if(color == selectedVariable && color != "reset"){
            setIsPickerOpen(prevState => !prevState)
        }
        if(color != "reset"){
            setSelectedVariable(color)
        }
        if(color == 'reset'){
            setIsPickerOpen(false)
            document.documentElement.style.setProperty("--text", "#fdfcfd");
            document.documentElement.style.setProperty("--background", "#161315");
            document.documentElement.style.setProperty("--primary", "#4d5c52");
            document.documentElement.style.setProperty("--secondary", "#171a1c");
            document.documentElement.style.setProperty("--accent", "#748b7d");
        }
        if(color == "--text"){
            document.documentElement.style.setProperty("--pos", "540px");
        }
        else if(color == "--background"){
            document.documentElement.style.setProperty("--pos", "300px");
        }
        else if(color == "--primary"){
            document.documentElement.style.setProperty("--pos", "-25px");
        }
        else if(color == "--secondary"){
            document.documentElement.style.setProperty("--pos", "-290px");
        }
        else if(color == "--accent"){
            document.documentElement.style.setProperty("--pos", "-595px");
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal">
                {isPickerOpen && 
                    <div className='color-selector'>
                        <Colorful color={hsva} onChange={(color) => {handleChange(color.hsva);}}/>
                        <div style={{ background: hsvaToHex(hsva), padding: 20, marginTop: 10, borderRadius: 8  }}></div>
                    </div>
                }
            <div className="modal-content">
                <div className="color-options">
                    <button onClick={() => handleToggle('--text')}>text color</button>
                    <button onClick={() => handleToggle('--background')}>background color</button>
                    <button onClick={() => handleToggle('--primary')}>primary color</button>
                    <button onClick={() => handleToggle('--secondary')}>secondary color</button>
                    <button onClick={() => handleToggle('--accent')}>accent color</button>
                    <button onClick={() => handleToggle('reset')}>reset</button>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;