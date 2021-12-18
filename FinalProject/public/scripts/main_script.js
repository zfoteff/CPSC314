var loadUserSectionsAndDocuments = async function() {
    $.getJSON('/home/getUserDocs', async function(data) {
        console.log(data)
            //  Get sidebar sections element
        var sections = $('#sections');
        //  GEtr document selector element
        var documentSelector = $('#section-selector');
        let i = 0;
        while (i < data.sections.length) {
            var sectionName = data.sections[i].name;
            //  Create new section element
            var newSection = document.createElement('li')
            newSection.classList.add('section');
            newSection.id = sectionName;

            var sectionLabel = document.createElement('a');
            sectionLabel.classList.add('section-link');
            sectionLabel.innerText = sectionName;

            //  Add section into drop down menu
            var newSectionOption = document.createElement('option');
            newSectionOption.setAttribute('value', sectionName);
            newSectionOption.innerText = sectionName;
            documentSelector.append(newSectionOption)

            //  Create section document container
            var documentContainer = document.createElement('ul');
            documentContainer.classList.add('document-container');
            documentContainer.id = (sectionName.replace(/\s/g, "-"));

            // create subsections
            let j = 0;
            while (j < data.sections[i].subsections.length) {
                var subsectionName = data.sections[i].subsections[j].name;
                var newSubsection = document.createElement('li')
                newSubsection.classList.add('section');

                var subsectionLabel = document.createElement('a');
                subsectionLabel.classList.add('section-link');
                subsectionLabel.innerText = subsectionName;

                //  Add subsection into drop down menu
                var option = document.createElement('option');
                option.setAttribute('value', subsectionName);
                option.innerText = subsectionName;
                documentSelector.append(option);

                //  Create subsection document container
                var subsectionDocumentContainer = document.createElement('ul');
                subsectionDocumentContainer.classList.add('document-container');
                subsectionDocumentContainer.id = (subsectionName.replace(/\s/g, "-"));

                //  Add subsection elements to DOM
                newSubsection.append(subsectionLabel);
                newSubsection.append(subsectionDocumentContainer);
                documentContainer.appendChild(newSubsection);
                j++;
            }

            //  Add section elements to DOM
            newSection.append(sectionLabel);
            sections.append(newSection);
            newSection.append(documentContainer);
            i++;
        }

        //  Create documents in the section
        let j = 0;
        while (j < data.documents.length) {
            var docName = data.documents[j].name;
            var docSection = data.documents[j].section.replace(/\s/g, "-");

            //  Create new document container
            var newDocContainer = document.createElement('li');
            newDocContainer.classList.add('document');
            newDocContainer.id = docName;
            newDocContainer.addEventListener('click', e => {
                if (e.target.id == docName) {
                    getDoc(docName);
                }
            })

            var newDoc = document.createElement('a');
            newDoc.classList.add('document-link');
            newDoc.textContent = docName + ".txt";

            var removeLink = document.createElement('button');
            removeLink.classList.add('remove-doc');
            removeLink.textContent = "Remove";
            removeLink.addEventListener('click', e => {
                if (e.target.id == newFile.filename)
                    removeDoc(newFile.filename)
            })

            newDocContainer.append(newDoc);
            newDocContainer.append(removeLink);
            $("#" + docSection).append(newDocContainer);
            j++;
        }
    })
}

var createDocument = function(newFile, sectionName) {
    var newDocContainer = document.createElement('li');
    newDocContainer.classList.add('document');
    newDocContainer.id = newFile.filename;

    /*
    var color = "#dbdbdb";
    if (newFile.color == "red" || newFile.color == "yellow" || newFile.color == "green" || newFile.color == "white") {
        if (newFile.color == "red")
            newDocContainer.style
    } else {

    }

    */
    newDocContainer.addEventListener('click', e => {
        if (e.target.id == newFile.filename) {
            getDoc(newFile.filename);
        }
    })

    //  Create doc link
    var newDoc = document.createElement('a');
    newDoc.classList.add('document-link');
    newDoc.textContent = newFile.filename + ".txt";

    //  Create remove button
    var removeLink = document.createElement('button');
    removeLink.classList.add('remove-doc');
    removeLink.textContent = "Remove";
    removeLink.addEventListener('click', e => {
        if (e.target.id == newFile.filename)
            removeDoc(newFile.filename)
    })

    newDocContainer.append(newDoc)
    newDocContainer.append(removeLink);
    $("#" + sectionName.replace(/\s/g, "-")).append(newDocContainer);
}

function getDoc(docName) {
    $.getJSON('/home/getDoc/' + docName, function(result) {
        console.log(JSON.stringify(result.plaintext))
        $('#document-window').addClass("hide");
        $("#edit-window").removeClass('hide');
        $('#edit-window').val("");
        $('#edit-window').val(JSON.stringify(result.plaintext));
    });
}

var uploadDocument = function(docName, sectionName) {
    createDocument({
        filename: docName,
        section: sectionName,
        color: "white",
        text: "Uploaded " + docName
    }, sectionName);
}

var removeDocument = function(docName) {
    console.log(docName);
    //  Remove from sidebar
    var docToRemove = $("#" + docName);
    $('#sections').remove(docToRemove);
}

$(window).on('load', function(req, res) {
    loadUserSectionsAndDocuments();
    $('#document-window').attr('src', 'public_docs/welcome.pdf')

    //  Button event listeners
    $("#create-section").on('click', () => {
        //  create new section
        //  add section to user object
        console.log("Creating new section");
        var sectionName = window.prompt("Enter name for new section", "Section Name");
        console.log(sectionName);
        if (sectionName == null || sectionName == "") {
            //  Cancel operation on invalid section name
            window.alert("No name provided for new section\nCancelling operation . . .");
        } else {
            //  Create new section and insert into database
            const newSection = { name: sectionName };
            var elementContainer = document.createElement('li');
            elementContainer.classList.add('section');

            //  Create section title element
            var elementTitle = document.createElement('a');
            elementTitle.classList.add('section-link')
            elementTitle.text = newSection.name;

            //  Create Document containter
            var documentContainer = document.createElement('ul');
            documentContainer.classList.add('document-container');
            documentContainer.id = (newSection.name.replace(/\s/g, "-"));

            //  Append to sections in sidebar
            elementContainer.append(elementTitle);
            elementContainer.append(documentContainer);
            $("#sections").append(elementContainer);

            //  Add option to drop down menu
            var option = document.createElement('option');
            option.setAttribute('value', newSection.name);
            option.innerText = newSection.name;
            $('#section-selector').append(option);

            //  Create new section in the database
            $.post('/home/createSection/' + sectionName, newSection, function(error) {
                if (error) console.log(error);
                console.log("Completed database upload");
            })
        }
    });

    $("#create-nested-section").on('click', () => {
        console.log("Creating new nested section");
        //  create new nested section
        //  add section to user object under the proper section
        var selector = document.getElementById("section-selector");
        var parentSectionName = selector.options[selector.selectedIndex].text;
        let subsectionName = window.prompt("Enter name for new subsection", "Subsection Name");

        console.log("Creating new subsection" + subsectionName);
        if (subsectionName == null || subsectionName == "") {
            window.alert("No name provided for new subsection\nCancelling operation . . .");
        } else {
            const newSection = { sectionName: subsectionName };
            var subsectionContainer = document.createElement('li');
            subsectionContainer.classList.add('section');

            //  Create subsection title element
            var subsectionTitle = document.createElement('a');
            subsectionTitle.classList.add('section-link');
            subsectionTitle.text = subsectionName;

            //  Create document container
            var docContainer = document.createElement('ul');
            docContainer.classList.add('document-container');
            docContainer.id = (subsectionName.replace(/\s/g, "-"));

            //  Add the subsection to the correct section in the sidebar
            var selector = document.getElementById("section-selector");
            var parentSection = selector.options[selector.selectedIndex].text;
            subsectionContainer.append(subsectionTitle);
            subsectionContainer.append(docContainer);
            $("#" + parentSection.replace(/\s/g, "-")).append(subsectionContainer);

            var option = document.createElement('option');
            option.setAttribute('value', subsectionName);
            option.innerText = subsectionName;
            $('#section-selector').append(option);

            //  Find section to append to
            $.post("/home/createSubsection/" + parentSectionName + "/" + subsectionName, newSection, function(error) {
                if (error) console.log(error);
                console.log("Completed database upload")
            });
        }
    });

    $('#create-button').on('click', () => {
        console.log("Creating editable file")
            //  Show save button and edit window, hide document viewer
        $("#save-text").removeClass('hide');
        $("#edit-window").removeClass('hide');
        $('#document-window').addClass("hide");
        $("#edit-window").val("");
    })

    $('#save-text').on('click', () => {
        console.log("Saving editable file");
        var filename = window.prompt("Enter a name for file", "untitled");

        if (filename != null && filename != "") {
            filename = filename;
            var text = $("#edit-window").val();
            $("#edit-window").val("");
            var selector = document.getElementById("section-selector");
            var section = selector.options[selector.selectedIndex].text;
            var newFile = {
                "filename": filename,
                "text": text,
                "section": section,
                "color": "white"
            }

            createDocument(newFile, section);

            //  hide save button and edit window, show document viewer
            $("#save-text").addClass('hide');
            $("#edit-window").addClass('hide');
            $('#document-window').removeClass("hide");
            $('#edit-window').val("")

            $.post("/home/createDoc", newFile, function(error) {
                if (error) console.log(error);
                console.log("created text doc successfully");
            });
        }
    })

    $('#mail-button').on('click', () => {
        console.log("Mailing file");
        var address = $('#mail-address').text
        $('#mail').attr('action', "mailto:" + address + "?subject=NoteStore&body=" + $('#edit-window').val());
    })

    $('#upload-file').on('click', () => {
        console.log('Uploading file');

        if ($('#upload')[0].files.length == 1) {
            var filename = $('#upload')[0].files[0].name;
            var file = $($('#upload')[0].files[0])
            var selector = document.getElementById("section-selector");
            var selectedSection = selector.options[selector.selectedIndex].text;
            $('selected').text = filename;
            console.log(filename);

            uploadDocument(filename, selectedSection);
        }
    })
});