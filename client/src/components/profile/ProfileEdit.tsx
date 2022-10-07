import MainLayout from "../layout/MainLayout";
import { Form } from "react-router-dom";
import ImageUploading from "react-images-uploading";
import { useLoaderData } from "react-router-dom";
import { useState } from "react";

export default function ProfileEdit() {
  const { data: user } = useLoaderData() as { data: User | null };
  const [image, setImage] = useState([]);
  const [base64, setBase64] = useState("");
  const onChange = (imageList: any, addUpdateIndex: any) => {
    console.log(imageList[0]?.data_url);
    setImage(imageList);
    setBase64(imageList[0]?.data_url);
  };
  const divStyle = {
    backgroundImage: "url(" + user?.avatar + ")",
  };
  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        <ImageUploading
          value={image}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({
            imageList,
            onImageUpload,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            // write your building UI
            <div
              className="sm:h-96 w-full flex justify-center items-center"
              onClick={onImageUpload}
              {...dragProps}
            >
              <div
                className={
                  "sm:bg-repeat sm:w-full sm:h-full overflow-clip" +
                  (isDragging ? " bg-gray-300" : "")
                }
                style={divStyle}
              ></div>
              {imageList.length === 0 && (
                <div className="sm:absolute">
                  {" "}
                  <img
                    className="sm:absolute sm:h-44 sm:w-44 h-full  sm:rounded-full w-screen sm:object-contain"
                    src={`https://avatars.dicebear.com/api/pixel-art-neutral/${user?.login}.svg`}
                    alt="avatar"
                  />
                  <button className="relative bg-purple-500 p-2 rounded-2xl">
                    Change profile picture
                  </button>
                </div>
              )}
              {imageList.length !== 0 && (
                <div className="sm:absolute">
                  {" "}
                  <img
                    src={imageList[0]["data_url"]}
                    alt="avatar"
                    className="sm:absolute sm:h-44 sm:w-44 sm:p-4 sm:bg-purple-500 h-full  sm:rounded-full w-screen sm:object-contain"
                  />
                  <button className="relative bg-purple-500 p-2 rounded-2xl">
                    Change profile picture
                  </button>
                </div>
              )}
            </div>
          )}
        </ImageUploading>
        <Form
          method="put"
          action={"/profile/" + user + "/edit"}
          className="p-4 flex-col"
        >
          <div className="flex flex-col">
            <input type="text" name="nickname" placeholder="nickname" />
            <div className="flex flex-row gap-3">
              <label htmlFor="nickname">2 factor Auth</label>
              <input
                type="checkbox"
                name="two_factor_auth_boolean"
              />
            </div>

            <input
              type="text"
              name="avatar"
              value={base64}
              onChange={(e) => e}
              hidden
            />
          </div>
          <button type="submit"> submit</button>
        </Form>
      </div>
    </MainLayout>
  );
}
