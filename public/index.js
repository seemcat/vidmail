const ziggeoApp = new ZiggeoApi.V2.Application({
  token: "f181815deef925afd6e72d76fb78bf0d"
});

let elementToDisplay = document.getElementById('elementToDisplay');
let tag;

document.getElementById('addTag').onclick = () => {
  tag = document.getElementById("mailTo").value;
  elementToDisplay.innerHTML = `
    <div id="item">
    <ziggeorecorder id="recorder-embedding" ziggeo-tags='${tag}' ziggeo-width=640 ziggeo-height=480 ziggeo-theme="minimalist" ziggeo-themecolor="red"></ziggeorecorder>
    <div id="nextAction"></div>
    </div>
    `;

  const element = document.getElementById('recorder-embedding');
  /*  Needed to use setTimeout to give the recorder time to
   *  start its video hosting process. Otherwise my app would
   *  be checking for the processed event before the video has
   *  even started to upload.
   */
  setTimeout(() => {
    ZiggeoApi.V2.Recorder.findByElement(element).on('processed', () => {
      fetch("/mail", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mailTo: tag
        }),
      }).catch(err => console.error('Error: ', err));

      const nextAction = document.getElementById('nextAction');
      nextAction.innerHTML =`
        <div><button id="next" type="button" class="btn recorder-btn">Next</button></div>
        `;

      document.getElementById('next').onclick = () => {
        elementToDisplay.innerHTML = `
        <div class="item">
        <div class="success-title">Yay, you've sent a video to <u>${tag}</u>!</div>
        <div><a href="https://hello.vimgirl.com/" id="next"><button type="button" class="btn vm-btn">Send another one!</button></a></div>
        </div>
        `;
      };
    });
  }, 2000);
};
