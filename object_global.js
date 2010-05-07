
///////////////////////////
// Define our global object
///////////////////////////

global = {
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
        "PV1fzwToWcv//Z",

    farb_wheel: "data:image/png;base64,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",

    farb_mask: "data:image/png;base64,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",

    farb_marker: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA" +
    "7bUf6AAAAK3RFWHRDcmVhdGlvbiBUaW1lAHZyIDE0IGp1bCAyMDA2IDEzOjMxOjIzICswMTAwH" +
    "vJDZwAAAAd0SU1FB9YHDgsgJYiZ4bUAAAAJcEhZcwAALiIAAC4iAari3ZIAAAAEZ0FNQQAAsY8" +
    "L/GEFAAAB5ElEQVR42q2Tz0sqURTH72Qq4mASSAoSIfSDdCEI8qJFLXSjLYSQNoGLINrI8/0ZD" +
    "9q0KnDlKkIMebmP9xZRCEEiLQLBiMiNJDYq/Zg573vpCkM6CdGBD3Pn3OvXe77nDGPfENKwJBH" +
    "x/CxYAtNAAVfgXJKk7khVCCyCP6ALVKAJXkEdbINxw5tgM4HHPphSFEUql8usXq8zWZZZKBRiP" +
    "p+PH3sBx2Br4FbiBg+aplGxWKRgMPiMH1+YTKZDq9V64na7G+l0mprNJo7RG/g94IEoQSsUCuR" +
    "yue6QToIJYAJWMA/Bo2QySZ1Ohws9gZBeZI570Gq1yO/395BKGJg+ZbFYznK5HAmf9vQiKW5iq" +
    "VQim832Fyn5E+83Y7EYieAdY2Nig7dRqtVqrNfr3YiWGsVltVrtr2f0IrwEZrfbGeqWhQ9GMeF" +
    "wOPprRS9SAWo4HGZOp/MH1l4DAS6+HolE+u9Xek9kcK+qKqVSKUL/s0hPDhFY83g8j5VKhcQg7" +
    "nxs80/w0mg0KB6Pa2az+RTpDbDA3sd/lwvk8/l+Z7iS/FHEAor8H9rtNmWzWYpGo+T1eikQCFA" +
    "mkyFxAy7AJ255aMHYcIID8d1oNBi8hGuwwkYFDq0CPlG3YsTb4B/4BRwjBb4S/wGzT16tu5THi" +
    "AAAAABJRU5ErkJggg=="
};
