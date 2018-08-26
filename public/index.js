const ziggeoApp = new ZiggeoApi.V2.Application({
  token: "f181815deef925afd6e72d76fb78bf0d"
});

let elementToDisplay = document.getElementById('elementToDisplay');
let msgToDisplay = document.getElementById('warning');
let user, tag;

document.getElementById('login').onclick = () => {
  user = document.getElementById("user").value;
  if (user && user.includes('@')) {
    fetch("/login", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user 
      }),
    }).catch(err => console.log('Login Error: ', err));

    elementToDisplay.innerHTML = `
      <div class="item">
  <div class="title">Who do you want to send a video message to?</div>
  <div class="form-group">
  <input type="email" class="form-control vim-input" id="mailTo" aria-describedby="emailHelp" placeholder="Please enter their email">
  </div>
  <button id="addTag" type="button" class="btn vm-btn">Next</button>
  <div id="warning" class="msg"></div>
    </div>`;

    document.getElementById('addTag').onclick = () => {
      tag = document.getElementById("mailTo").value;
      if (tag && tag.includes('@')) {
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
                user,
                mailTo: tag,
              }),
            });

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
      } else {
        msgToDisplay.innerHTML = `Please enter a valid email address.`;
        fetch("/inputFail", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user }),
        });
      }
    };
  } else {
    msgToDisplay.innerHTML = `Please enter a valid email address.`;
    fetch("/inputFail", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user }),
    });
  }
}
