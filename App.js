import React, { useState } from 'react';
import { SafeAreaView, Button, Text, ScrollView, View } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import PdfLib from 'react-native-pdf-lib';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import ImageResizer from 'react-native-image-resizer';

const App = () => {
  const [images, setImages] = useState([]);       // State to hold selected images
  const [pdfUri, setPdfUri] = useState(null);     // State to hold the generated PDF URI
  const [hdImageUri, setHdImageUri] = useState(null); // State to hold the HD image URI

  // Step 3: Image Picker - Select multiple images
  const selectImages = () => {
    const options = {
      title: 'Select Images',
      takePhotoButtonTitle: 'Take a Photo',
      chooseFromLibraryButtonTitle: 'Choose from Library',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
      allowsMultipleSelection: true, // Allow multiple selection
    };
    
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImages(response.assets); // Save selected images
      }
    });
  };

  // Step 4: Resize the image to HD quality (1920x1080) with 90% quality
  const resizeToHD = (uri) => {
    return new Promise((resolve, reject) => {
      ImageResizer.createResizedImage(uri, 1920, 1080, 'JPEG', 90) // Resize to HD
        .then((resizedImage) => {
          resolve(resizedImage.uri); // Return resized HD image URI
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // Step 5: Convert selected image to HD and update the state
  const convertToHD = async (uri) => {
    try {
      const hdUri = await resizeToHD(uri); // Resize image to HD
      setHdImageUri(hdUri); // Set HD image URI for preview or sharing
      alert('Image converted to HD quality!');
    } catch (error) {
      console.log('Error converting to HD: ', error);
    }
  };

  // Step 6: Generate PDF from selected images
  const generatePDF = async () => {
    if (images.length === 0) {
      alert('No images selected!');
      return;
    }
    try {
      const pdfPath = `${RNFS.ExternalStorageDirectoryPath}/Download/generated.pdf`; // Path to save PDF

      const pdf = PdfLib.create();
      for (let image of images) {
        // Resize each image before adding to PDF
        const resizedImageUri = await resizeToHD(image.uri);
        
        // Add the resized image to PDF
        pdf.addPage(PdfLib.PageMediaBox.A4); // Create A4 page
        pdf.addImage(resizedImageUri, 'JPEG', 0, 0, 600, 800); // Add image to PDF (adjust image size as needed)
      }

      await pdf.writeToFile(pdfPath); // Save PDF
      setPdfUri(pdfPath); // Set PDF URI for further sharing or opening
      alert('PDF generated in Downloads folder!');
    } catch (error) {
      console.log('Error generating PDF: ', error);
    }
  };

  // Step 7: Share the generated PDF
  const sharePDF = () => {
    if (!pdfUri) {
      alert('No PDF to share!');
      return;
    }
    Share.open({
      url: `file://${pdfUri}`,
      type: 'application/pdf',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        {/* Button to select images */}
        <Button title="Select Images" onPress={selectImages} />
        <Text>Selected Images: {images.length}</Text>

        {/* Button to generate PDF if images are selected */}
        {images.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Button title="Generate PDF" onPress={generatePDF} />
          </View>
        )}

        {/* Button to convert first selected image to HD quality */}
        {images.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Button title="Convert to HD" onPress={() => convertToHD(images[0].uri)} />
          </View>
        )}

        {/* Display HD Image URI */}
        {hdImageUri && (
          <View style={{ marginTop: 20 }}>
            <Text>HD Image URI: {hdImageUri}</Text>
          </View>
        )}

        {/* Button to share generated PDF */}
        {pdfUri && (
          <View style={{ marginTop: 20 }}>
            <Button title="Share PDF" onPress={sharePDF} />
            <Text style={{ marginTop: 10 }}>PDF Path: {pdfUri}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
