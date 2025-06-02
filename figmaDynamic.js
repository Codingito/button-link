const size_to_nodeid = {
    "xs" : "1:5827",
    "sm" : "1:5834",
    "md" : "1:5845",
    "lg" : "1:5856"
}


async function fetchFigmaNodeDetails(button_size) {
  const fileUrl = `https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=${size_to_nodeid[button_size]}&t=HY9OkJ2VzoHe7YnC-4`;

  const response = await fetch('https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({fileUrl})
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}



export default fetchFigmaNodeDetails;