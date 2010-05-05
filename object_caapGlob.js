
///////////////////////////
// Define our global object
///////////////////////////

caapGlob = {
	
	thisVersion: "140.22.15",

    gameName: 'castle_age',

    discussionURL: 'http://senses.ws/caap/index.php',

    debug: false,

    newVersionAvailable: false,

    documentTitle: document.title,

    is_chrome: navigator.userAgent.toLowerCase().indexOf('chrome') != -1 ? true : false,

    is_firefox: navigator.userAgent.toLowerCase().indexOf('firefox') != -1  ? true : false,

    // Object separator - used to separate objects
    os: '\n',

    // Value separator - used to separate name/values within the objects
    vs: '\t',

    // Label separator - used to separate the name from the value
    ls: '\f',

    hashStr: [
        '41030325072',
        '4200014995461306',
        '2800013751923752',
        '55577219620',
        '65520919503',
        '2900007233824090',
        '2900007233824090',
        '3100017834928060',
        '3500032575830770',
        '32686632448',
        '2700017666913321'
    ],

    //http://image2.castleagegame.com/graphics/symbol_tiny_1.jpg
    symbol_tiny_1: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAA" +
        "D/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgEBAQEBAgEBAgMC" +
        "AQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCgoKDAwMDAwMDAwMDA" +
        "ECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM" +
        "DAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAIQAAQADAQAAAAAAAAAAAAAAAA" +
        "gFBgcJAQEBAQAAAAAAAAAAAAAAAAAGBwUQAAEEAQMCBAQHAAAAAAAAAAIBAwQFBhESBxMI" +
        "ACExCXEjFBZBUYEiMhUYEQABAgMFBwEJAAAAAAAAAAABEQIAAwQxQVESBfAhYYHBEwYika" +
        "Gx0eEyQiMU/9oADAMBAAIRAxEAPwDmv2BdhuJ8oYbZ9yXcRauVnE8Ga1V1rGiuP2VlKNeh" +
        "EjtuIQKSj8xwzEgbb0XQiJNmxomlirnS5btwcQpwC7zBzyjW36dSTp8oZnsY4taSmZwBIC" +
        "4G+EbcUPt45C9I4pzfAr3Ha2OZ1p5PW3y2zjDrZK0Ug62fHRhQ3Ju2t7SRPRdfCSt8TdLL" +
        "mscHISACEsOOPKDekeYf0yJU57cudjXFDYSATyXjBwyP2x52J99uPdu0/IIw8Q5THk30LK" +
        "jfkDXLSxa1+7KaJISuq0saKZI2pIe4Sb3aojijnUiTA1LSiXrhDltcDKL1sCrwjY+OLn72" +
        "9uHDX8KLqMYdcynsgYY8ya+uiR47EoxTz2g7GJlS9EX4+FXjE1oel7mhOV22EEvKJLnDfv" +
        "AJXnt74jcx5Hhcg4+w/OKJCyaPMluN18JohOQ3KGMoqKCiqZK4JqpEuqr5J+SOaiszENei" +
        "rcMdr4m+laN/C89vM5pa0KSqZV9gQhAIunPVVe22e8GdvcRVPmerxe+CVDRfnip0l1YpAX" +
        "8eoLL4N7PXU9PE+dVSxXib+Jf0ResU+XTzDQOZfl6gp0gn+3pcd5mO5bYTO22n+4cYUpCW" +
        "sN+TFiQ0aRNX1dcslbY6W3Tf1EUPgvn4OUjpgHpCjayE1e2UfvKQj7LmHlSwmRoXFnEmOQ" +
        "uYPr4SwZVNb4sMj+wGSKtJFVq1lj+400Xptaaa66J436mZW9v9jX5eNnP6wcp5VD3PQ9q8" +
        "Afl8IKE+d3l/7Hg29vCe/wBKdZw6qqMz6nU3H1AA0P8Alpv1VXN2v6J4PudM7gJG+EzWyu" +
        "0QD6Y//9k%3D",

    //http://image2.castleagegame.com/graphics/symbol_tiny_2.jpg
    symbol_tiny_2: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAA" +
        "D/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgEBAQEBAgEBAgMC" +
        "AQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCgoKDAwMDAwMDAwMDA" +
        "ECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM" +
        "DAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAIUAAQADAAAAAAAAAAAAAAAAAA" +
        "gFBgkBAAIDAQEAAAAAAAAAAAAAAAMEAgUGCAcQAAIBAgUCBAUFAAAAAAAAAAIDAQQFERIT" +
        "BggAByExQSJRMkIUFVIjZBYXEQACAQIFAgQFBQAAAAAAAAABAhESAwAhMQQFQRNRYYEicb" +
        "EyFAbwoWIjM//aAAwDAQACEQMRAD8Ax8438d29wjdu3dD2qsYMzE0gmoFYMJ0KEEm1Qte6" +
        "UHkEigREZIsfbE0fIcglgVXJW2CAzAaE+PgvQkdT0x6V+Ifh1/lXO32YS5vWtm5btOYqVT" +
        "ogOT3SJZUYgFBPuJACRsvFzsjv3bNSior7tZ6dITjcbgduuNMJeQ6lGqioiwmfDBTRKPSZ" +
        "6LuxttraN92pUdQT6RrM9BnOEfx61zXO79OK2lvvXnJHbZFAEfVVkO2FzqaVpjUHBzruIO" +
        "+rZyIoez00tQR3NTqmKSXMGAWigi7SzUn3SiaaIdE4Z8mMYZ46gN45slipqC1RAqI+ExVH" +
        "SdY+GD3PxvajlF263rRtG6bTNW3aW4Mge5TV2SxBDxNAbwqKC4m2zb28OOz3JcoTtLkXOs" +
        "UbAURU50aLXmGTmMZXU0RjMfFgfrjGQvLasXKwDBMg9ZMgddQchGemFbexvbzlNt9u7IXS" +
        "2VdRmlCBS2qwEZDU0ikAnFjud/RtSoXCCL7EDJtMFVEQxjYnT/eGZGBMZjwzeXr7sMcptb" +
        "BsOl26pNoFqEJ/ygwS2RyHrRoJGeOgOc5teV2252WzvLb37JaG63KIAd8GQsEswwILQCR7" +
        "fuACzUkBTEdx91VNbyK7f0tO2B3zT2+sQ0dSIYTEWq7VRozep5K9SMPPPiHnGHW1ZgdwCO" +
        "imfUiPkccyWbbJx1xWBl7qBRGpRXqy8q1Hrgz8Tbh35s28qR3au3KvNIy6iu3076impZXc" +
        "p8c9K24RpxMBhq5wJWXDUj5eg7hUa4sEB8tRI8p89YzB1jDvGXdym1cMjNYNU0mGAyrIif" +
        "Z9NYZSmkw0HCY333B5CtRWJqNg20N1gp8vMLntVZlgM6mmxVVUCRT/AB1Ac/TMT0ZjfIg0" +
        "geOZ/Yx88JWk49HDI152kQoVVMzlDAuZnSFnwwTKur71/wC00l2u1LR/277QnWu1uJf4/w" +
        "DH6ZyalHJ6eXT1ImYZnz4+Op0qq2OwVU+3qf10iOkR5Yttxf5D7+3cuW/7M6FkzMmQDNXc" +
        "qmc+53P5QMf/2Q%3D%3D",

    //http://image2.castleagegame.com/graphics/symbol_tiny_3.jpg
    symbol_tiny_3: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAA" +
        "D/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgEBAQEBAgEBAgMC" +
        "AQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCgoKDAwMDAwMDAwMDA" +
        "ECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM" +
        "DAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAIIAAQEBAAAAAAAAAAAAAAAAAA" +
        "gHCQEBAQEBAQAAAAAAAAAAAAAABgUHAAEQAAAGAQQCAQMFAAAAAAAAAAECAwQFBhESFQcI" +
        "ExQAISJCMTJDFwkRAAIBAgQEAgkFAQAAAAAAAAECERIDACExQVFxBAVhIoGRoTJCghMjFL" +
        "HB0WJyBv/aAAwDAQACEQMRAD8AzJ6k9Y4NoyjbjdEkH3Is4VOWab22NJR9fjnay6UaIRah" +
        "0038pImbKKoJOR9VFsBVVCqisQqZrunXMtp7izRbgGDBZiQIDfConMjOZAiM7fbeiF66tt" +
        "jBYEyRIUAEzGUkxkCQNJ1yc/Kf+fPaCj8Zq2nmKaO64y0kK9jJlnVJ2Oik1FCoFM4im0LG" +
        "lImJjgBhjXRFUw+pDDjPwB03/UIbp+2sf1Zww+ZiQ/JlUHDBux2bgCI7hjAlghUk8VEFB4" +
        "hnIwIbB0WbxPaev16Cr/u1aWfPYWbpyk46RjYuWaxm8IrbvoO6Ug3LUSvkjYK6MgRdvq86" +
        "XmNpyNdJbp2YBxBDRqvGNKhmDtMGIMYAmiBdA8u4nQ8J4e3UbTi9cIPYKTbxHJrUFHVfjU" +
        "qBc1SMkvIopBs61C1V0oQgCAmTZyVeetFMftNgPzDMbrrVfbr1uCWVmmP91A8oIPLFbtrR" +
        "1tsggVLAnIe4VieM5DacLLsNz7ykXiezueUeWIud6vyDCYLxc2iW5d7n3E4r5kkpEchpJE" +
        "BlMpvp+oasGDHzMbHRWiyhLbfUMBtx8vEvr4csK+nN9bpLMKUk55RB+LgF08ecYIk7aXZX" +
        "7FBY5k7i+eQ0MxQNgFnMhA123ykggXIhlVu2srFAxQyOtYpMZyAbTd83VoB8KNPzFY9dJ9" +
        "WM9TKyxO7CPRM/qMHfo3Y+0FdYxbKp1t3ZeOJCWlkau4hpJpFzca9K1SNLrx6r9JwmaPFH" +
        "wg/I7bKMjfYBxTVEhw8uJVemy1NwATlII2q0z1jMHmMscphPuCUnLYg7x++UenFxczYtJh" +
        "+9r8bNS1z1a9pjWdGgTisQfvIwlAnp9IFDH/JrHicTY0AQcYgdvNs9S30BbFwznLEDjQCF" +
        "HOlvZhF3H8n8Vfr1G2I2UE5eWsgltPdqGDZcrl2B/vqoXq9VGI2ba3i9JpKztbatt8rsjt" +
        "BB0m99rc/a85jmM4973cfzaC/Ltq0lLojNXUKmjzVZRlGmm1NPhOD7s0hmApjIbR/PpmfH" +
        "H//Z",

    //http://image2.castleagegame.com/graphics/symbol_tiny_4.jpg
    symbol_tiny_4: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAA" +
        "D/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgEBAQEBAgEBAgMC" +
        "AQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCgoKDAwMDAwMDAwMDA" +
        "ECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM" +
        "DAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAIUAAQEAAAAAAAAAAAAAAAAAAA" +
        "gJAQACAgMAAAAAAAAAAAAAAAAEBgEDBQcIEAABBAEEAgECBwAAAAAAAAADAQIEBQYREhMH" +
        "FAgAMhUxIkJjFhcJEQACAQIEAwUFCQEAAAAAAAABAhESAwAhMQRBYQVRsSJSE/BxwdFCgZ" +
        "Gh4fEyYhQVBv/aAAwDAQACEQMRAD8AlB6l+qd/2bJNdtiksLgYfvEhxI6zh1sIpnjitHCK" +
        "8Y5M6VxuINhl4hhTe5pFe1rVjqPVrNpgL9z0rc0z5miSJ+kDidZykRmJf3ABhmhZj3n4YS" +
        "OG+tNH2/HPhzbW8iSxo8T0vQ01rXhc38qoesZWQVG1FTRfHKN7f0rr8I3O32O2tf2HahfP" +
        "UeOmcmqeAznsxLJbQVTHOT7HBnsfT3IYHs5XdUQa5TOnzT082mfOmDgxZQQeaOSkvjWS+t" +
        "KDSSxdqHUbSC15Gciir1pDtjca4AoAYPTqsxNPmGYIiJgxBjELufASW4TPKezt/XDA/wAs" +
        "JCZDdBHjUmMMzn1VhOSWJxmkqT4/X0vI1jCCVeCfTHjKuujXqmv1Jqt/9jt7b9FveoGLWn" +
        "Y5EAyWMEyDkQ4J5YD3yg2GnVSe/wCRxQCwh+tcrL+wca6zHHh91QYsCTey5bHFjkcQGg3I" +
        "1j2aoxdqG2qi7tNV1+aFf/UTabS5uyx2rM1ABg658Dmc6ZnKYywun1giF/2GY9u7E0Mwz+" +
        "2me0+NWEcoG9gjdHiOaqKgiz4NfkdocCN13KogXEYKs13akRn1Jp86du9LtMibMA0LYZT5" +
        "oakDlJpPKRhsNkGLY0Cn8Y+WDF6c2Ps3VZTXh6XrJ9uSTPmso34/KSHaxZCMGs0kV5Rkas" +
        "ZW8SSUOJ8dV2I7a/a5COqpt2W4bjAAJ46hKFP56c4ghveMWbhUJaSBlnOkc/hxwprjK/cY" +
        "trbgxnHLB3ao48tbv+ONx+BcFCip5SOlBubZUVXablFDRyr+G1dPgO7ey21tC8thbMrQSa" +
        "ln6KRC/Z4tNcpxU8FBVSFyjiOUCB34Gdzc9x/3DUZDkNRF+6eOYlBQEMfh4+cqGGMrTc/m" +
        "c/IrlUvk+R+5tT5mbVpaXRGauoVNHiqyjKNNOFNPKcEKgggEzOZ4z935Rj//2Q%3D%3D",

    //http://image2.castleagegame.com/graphics/symbol_tiny_5.jpg
    symbol_tiny_5: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAA" +
        "D/7AARRHVja3kAAQAEAAAAVQAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgEBAQEBAgEBAgMC" +
        "AQIDAwICAgIDAwMDAwMDAwQDBAQEBAMEBAUGBgYFBAcHCAgHBwoKCgoKDAwMDAwMDAwMDA" +
        "ECAgIEAwQHBAQHCggHCAoMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM" +
        "DAwMDAwMDAwMDAwM/8AAEQgAFgAWAwERAAIRAQMRAf/EAGsAAQEAAAAAAAAAAAAAAAAAAA" +
        "gJAQEBAQAAAAAAAAAAAAAAAAABAgMQAAEDAgUCBAYDAAAAAAAAAAIBAwQFBhESEwcIABQx" +
        "IhUJIUEyQmIWM0QXEQEBAQADAAAAAAAAAAAAAAABABEhQQL/2gAMAwEAAhEDEQA/AI58et" +
        "hnb+kS7muKYUSgQybdmTnm+67dJJuJGjx4zhgD0p9GjNEcXTbbTOSEpCPUgZUtQmkeyg5u" +
        "pxKp3J7ba7JFZ20lNKNZkxKhT6y9bcgSVsm6zRXKZAJsRVMSKM6mAqhCuCoqmkQKkcMNzI" +
        "nKuPxvbZYW5Jb5xXAOe8FLBoI3qQzxl4K6UE4grJT4auQTb/kHFVCRml7Hd+bQ29cb8vda" +
        "2ot47bNSDC8qBLjsSXDoNaokOjJPjg+ipnhS6caIqYKhYChCpovQmkdyZ5Pcsmvbkvxqwf" +
        "b8u+3K9wfuejzQl0ZuSFWkTptRh+nzv2lpQizYzzSGgxQzNoIj5kVVLqPPnGVgPflyy6ty" +
        "usymwHsLzp1DKmzFzojpyW6XXagUfH5ugxUWW8vjmPL4ph1qwR64hv8AJWDudETjzHkzrn" +
        "cfmDC9MeBh5oEbRZhEUsCY7XTypISQCsYYZsFyr0DxKSOu+8eXs15+E1alIj30KFqSaa5b" +
        "LEwzRP67hVWe1qL9uhHQsfowXp2MiJJlbpf6jGqVRjJ+4ec6fTiORn1O4LOAGha3caubFV" +
        "PV1fzwToWcv//Z"
};

