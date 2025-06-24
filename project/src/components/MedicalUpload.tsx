const MedicalUpload = () => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file.name);
      // Upload to backend using fetch/Axios
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-bold mb-2">Upload Medical Files</h3>
      <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
    </div>
  );
};

export default MedicalUpload;
